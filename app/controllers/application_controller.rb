require 'current_user'
require_dependency 'ffmpeg'
require_dependency 'youtube_dl'

class ApplicationController < ActionController::Base
  include CurrentUser
  
  protect_from_forgery

  def handle_unverified_request
    unless is_api?
      super
      clear_current_user
      render json: {error: "BAD CSRF"}, status: 403
    end
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
end
