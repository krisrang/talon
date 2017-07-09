require 'current_user'
require_dependency 'secure_session'
require_dependency 'ffmpeg'
require_dependency 'youtube_dl'

class ApplicationController < ActionController::Base
  include CurrentUser
  helper_method :serialize
  
  protect_from_forgery with: :exception

  rescue_from ActionController::InvalidAuthenticityToken do |e|
    unless is_api?
      clear_current_user
      render_json_error("BAD CSRF", "csrf", 403)
    end
  end

  rescue_from RateLimiter::LimitExceeded do |e|
    render_rate_limit_error(e)
  end

  before_action :set_current_user_for_logs
  before_action :authorize_mini_profiler
  after_action :perform_refresh_session

  def set_current_user_for_logs
    if logged_in?
      Raven.user_context('id' => current_user.id)
    end
  end

  def mini_profiler_enabled?
    defined?(Rack::MiniProfiler) && (Rails.env.development? || admin?)
  end

  def authorize_mini_profiler
    return unless mini_profiler_enabled?
    Rack::MiniProfiler.authorize_request
  end

  def perform_refresh_session
    refresh_session(current_user)
  end

  def create_shadow_user
    u = User.create!(shadow: true)
    log_on_user(u)
  end

  def require_user
    return if current_user

    respond_to do |format|
      format.html { redirect_to login_path }
      format.json { render json: {error: "unauthenticated"} }
    end
  end

  def secure_session
    SecureSession.new(session["secure_session_id"] ||= SecureRandom.hex)
  end

  def render_json_error(error, type="default", status=422)
    render json: {error: error, error_type: type}, status: status
  end

  def render_rate_limit_error(e)
    render_json_error(e.description, "rate_limit", 429)
  end

  def flat_errors(obj)
    obj.errors.to_hash.map { |k, v| [k, v[0]] }.to_h
  end

  def serialize(resource)
    ActiveModelSerializers::SerializableResource.new(resource)
  end

  def already_logged_in
    render json: {
      success: true,
      message: I18n.t("login.already_logged_in", current_user: current_user.email)
    }
  end
end
