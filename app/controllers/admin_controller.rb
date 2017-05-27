require_dependency 'youtube_dl'
require_dependency 'ffmpeg'

class AdminController < ApplicationController
  def index; end

  def youtubedl_update
    MessageBus.publish "/youtubedl-update", Talon.instance_id
    YoutubeDL.update!
    version = YoutubeDL.version

    respond_to do |format|
      format.json { render json: {version: version} }
      format.html { redirect_to :admin }
    end
  end
end
