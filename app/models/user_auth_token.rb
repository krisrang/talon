# frozen_string_literal: true
require 'digest/sha1'

class UserAuthToken < ActiveRecord::Base
  belongs_to :user

  ROTATE_TIME = 10.minutes
  # used when token did not arrive at client
  URGENT_ROTATE_TIME = 1.minute

  attr_accessor :unhashed_auth_token

  def self.generate!(info)
    token = SecureRandom.hex(16)
    hashed_token = hash_token(token)
    user_auth_token = UserAuthToken.create!(
      user_id: info[:user_id],
      user_agent: info[:user_agent],
      client_ip: info[:client_ip],
      auth_token: hashed_token,
      prev_auth_token: hashed_token,
      rotated_at: Time.zone.now
    )
    user_auth_token.unhashed_auth_token = token

    user_auth_token
  end

  def self.lookup(unhashed_token, opts=nil)
    mark_seen = opts && opts[:seen]

    token = hash_token(unhashed_token)
    expire_before = Settings.maximum_session_age.hours.ago

    user_token = find_by("(auth_token = :token OR
                          prev_auth_token = :token) AND rotated_at > :expire_before",
                          token: token, expire_before: expire_before)

    if !user_token
      return nil
    end

    if user_token.auth_token != token && user_token.prev_auth_token == token && user_token.auth_token_seen
      UserAuthToken
        .where("rotated_at < ?", 1.minute.ago)
        .where(id: user_token.id, prev_auth_token: token)
        .update_all(auth_token_seen: false)
    end

    if mark_seen && user_token && !user_token.auth_token_seen && user_token.auth_token == token
      # we must protect against concurrency issues here
      changed_rows = UserAuthToken
        .where(id: user_token.id, auth_token: token)
        .update_all(auth_token_seen: true, seen_at: Time.zone.now)

      if changed_rows == 1
        # not doing a reload so we don't risk loading a rotated token
        user_token.auth_token_seen = true
        user_token.seen_at = Time.zone.now
      end
    end

    user_token
  end

  def self.hash_token(token)
    Digest::SHA1.base64digest("#{token}#{Rails.application.secrets.secret_key_base}")
  end

  def self.cleanup!
    where('rotated_at < :time',
          time: Settings.maximum_session_age.hours.ago - ROTATE_TIME).delete_all

  end

  def rotate!(info=nil)
    user_agent = (info && info[:user_agent] || self.user_agent)
    client_ip = (info && info[:client_ip] || self.client_ip)

    token = SecureRandom.hex(16)

    result = UserAuthToken.exec_sql("
      UPDATE user_auth_tokens
      SET
        auth_token_seen = false,
        seen_at = null,
        user_agent = :user_agent,
        client_ip = :client_ip,
        prev_auth_token = case when auth_token_seen then auth_token else prev_auth_token end,
        auth_token = :new_token,
        rotated_at = :now
      WHERE id = :id AND (auth_token_seen or rotated_at < :safeguard_time)
    ", id: self.id,
      user_agent: user_agent,
      client_ip: client_ip&.to_s,
      now: Time.zone.now,
      new_token: UserAuthToken.hash_token(token),
      safeguard_time: 30.seconds.ago
    )

    if result.cmdtuples > 0
      reload
      self.unhashed_auth_token = token
      true
    else
      false
    end
  end
end
