require_dependency 'ffmpeg'
require_dependency 'youtube_dl'

class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
end
