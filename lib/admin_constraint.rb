require_dependency 'current_user'

class AdminConstraint
  def matches?(request)
    provider = Talon.current_user_provider.new(request.env)
    provider.current_user && provider.current_user.admin?
  rescue Talon::InvalidAccess
    false
  end
end
