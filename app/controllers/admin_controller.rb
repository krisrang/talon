class AdminController < ApplicationController
  def index; end

  def youtubedl_update
    MessageBus.publish "/youtubedl-update", Talon.instance_id
    version = YoutubeDL.update!
    Rails.cache.delete("youtubedl-extractors")

    respond_to do |format|
      format.json { render json: {version: version} }
      format.html { redirect_to :admin }
    end
  end
end
