require 'rufus-scheduler'
require_dependency 'auth'
require_dependency 'settings'

module Talon
  class InvalidAccess < StandardError; end
  
  def self.instance_id
    @@instance_id ||= SecureRandom.hex
  end

  def self.current_user_provider
    @current_user_provider || Auth::CurrentUserProvider
  end

  def self.current_user_provider=(val)
    @current_user_provider = val
  end

  def self.email_regex
    /\A[a-zA-Z0-9!#\$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-zA-Z0-9!#\$%&'\*+\/=?\^_`{|}~\-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$\z/
  end

  def self.base_url
    Rails.env.production? ? "https://talon.rip" : "http://localhost:3000"
  end

  def self.clear_caches!
    Rails.cache.delete("youtubedl-extractors")
  end

  def self.after_fork
    ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
    $redis.client.reconnect
    MessageBus.after_fork
    _ = Rufus::Scheduler.singleton
  end
end
