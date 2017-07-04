class EmailToken < ActiveRecord::Base
  belongs_to :user

  validates :token, :user_id, :email, presence: true

  before_validation(on: :create) do
    self.token = EmailToken.generate_token
    self.email = self.email.downcase if self.email
  end

  after_create do
    # Expire the previous tokens
    EmailToken.where(user_id: self.user_id)
              .where("id != ?", self.id)
              .update_all(expired: true)
  end

  def self.token_length
    16
  end

  def self.valid_after
    Settings.email_token_valid_hours.hours.ago
  end

  def self.unconfirmed
    where(confirmed: false)
  end

  def self.active
    where(expired: false).where('created_at > ?', valid_after)
  end

  def self.confirmable(token)
    EmailToken.where(token: token)
              .where(expired: false, confirmed: false)
              .where("created_at >= ?", EmailToken.valid_after)
              .includes(:user)
              .first
  end

  def self.generate_token
    SecureRandom.hex(EmailToken.token_length)
  end

  def self.confirm(token)
    User.transaction do
      result = atomic_confirm(token)
      user = result[:user]
      if result[:success]
        user.active = true
        user.email = result[:email_token].email
        user.save!
      end

      user
    end
  rescue ActiveRecord::RecordInvalid
    # If the user's email is already taken, just return nil (failure)
  end

  def self.valid_token_format?(token)
    token.present? && token =~ /\h{#{token.length/2}}/i
  end

  def self.atomic_confirm(token)
    failure = { success: false }
    return failure unless valid_token_format?(token)

    email_token = confirmable(token)
    return failure if email_token.blank?

    user = email_token.user
    failure[:user] = user
    row_count = EmailToken.where(confirmed: false, id: email_token.id, expired: false).update_all('confirmed = true')

    if row_count == 1
      { success: true, user: user, email_token: email_token }
    else
      failure
    end
  end
end
