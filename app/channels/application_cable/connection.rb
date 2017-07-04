module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end
 
    private

    # no remote API key connections, only local origin
    def find_verified_user
      provider = Talon.current_user_provider.new(request.env)
      if provider.has_auth_cookie? && user = provider.current_user
        user
      else
        reject_unauthorized_connection
      end
    end
  end
end
