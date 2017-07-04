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
end
