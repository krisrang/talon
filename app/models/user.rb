require_dependency 'pbkdf2'

class User < ActiveRecord::Base
  has_many :email_tokens, dependent: :destroy
  has_many :user_auth_tokens, dependent: :destroy

  before_validation :strip_downcase_email

  validates :email, presence: true, uniqueness: true
  validates :email, format: { with: Talon.email_regex }, if: :email_changed?
  validates :password, length: { minimum: Settings.min_password_length }, if: :password

  after_create :create_email_token
 
  before_save :ensure_password_is_hashed

  after_save :expire_old_email_tokens
  after_save :expire_tokens_if_password_changed

  attr_accessor :password
  
  def self.max_password_length
    200
  end

  def self.find_by_email(email)
    find_by(email: email.downcase)
  end

  def self.email_hash(email)
    Digest::MD5.hexdigest(email.strip.downcase)
  end

  def email_hash
    User.email_hash(email)
  end

  def email_confirmed?
    email_tokens.where(email: email, confirmed: true).present? || email_tokens.empty?
  end

  def activate
    if email_token = self.email_tokens.active.first
      EmailToken.confirm(email_token.token)
    else
      self.active = true
      save
    end
  end

  def deactivate
    self.active = false
    save
  end

  def confirm_password?(password)
    self.password_hash == hash_password(password, salt)
  end

  def update_ip_address!(new_ip_address)
    unless ip_address == new_ip_address || new_ip_address.blank?
      update_column(:ip_address, new_ip_address)
    end
  end

  def update_last_seen!(now=Time.zone.now)
    now_date = now.to_date
    # Only update last seen once every minute
    redis_key = "user:#{id}:#{now_date}"
    return unless $redis.setnx(redis_key, "1")

    $redis.expire(redis_key, Settings.active_user_rate_limit_secs)
    # using update_column to avoid the AR transaction
    update_column(:last_seen_at, now)
  end

  def generate_api_key
    self.api_key = SecureRandom.hex(32)
    self.save
    self.api_key
  end

  def revoke_api_key
    self.api_key = nil
    self.save
  end

  protected

  def expire_old_email_tokens
    if saved_change_to_password_hash? && !saved_change_to_id?
      email_tokens.where('not expired').update_all(expired: true)
    end
  end

  def create_email_token
    email_tokens.create(email: email)
  end

  def ensure_password_is_hashed
    if password
      self.salt = SecureRandom.hex(16)
      self.password_hash = hash_password(password, salt)
    end
  end

  def expire_tokens_if_password_changed
    # NOTE: setting raw password is the only valid way of changing a password
    # the password field in the DB is actually hashed, nobody should be amending direct
    if password
      # Association in model may be out-of-sync
      UserAuthToken.where(user_id: id).destroy_all
      # We should not carry this around after save
      self.password = nil
    end
  end

  def hash_password(password, salt)
    raise StandardError.new("password is too long") if password.size > User.max_password_length
    Pbkdf2.hash_password(password, salt, Rails.configuration.pbkdf2_iterations, Rails.configuration.pbkdf2_algorithm)
  end

  def strip_downcase_email
    if self.email
      self.email = self.email.strip
      self.email = self.email.downcase
    end
  end
end
