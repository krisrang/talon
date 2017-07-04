require 'current_user'
require_dependency 'ffmpeg'
require_dependency 'youtube_dl'

class ApplicationController < ActionController::Base
  include CurrentUser
  
  protect_from_forgery with: :exception

  before_filter :set_current_user_for_logs
  before_filter :authorize_mini_profiler
  after_filter :perform_refresh_session

  def set_current_user_for_logs
    if current_user
      Raven.user_context('id' => current_user.id)
    end
  end

  def mini_profiler_enabled?
    defined?(Rack::MiniProfiler) && (current_user.admin? || Rails.env.development?)
  end

  def authorize_mini_profiler
    return unless mini_profiler_enabled?
    Rack::MiniProfiler.authorize_request
  end

  def perform_refresh_session
    refresh_session(current_user)
  end
end
