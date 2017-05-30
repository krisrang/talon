require_dependency 'youtube_dl'

class DownloadsController < ApplicationController
  skip_before_action :verify_authenticity_token

  rescue_from YoutubeDL::RunError do |e|
    render json: {error: e.message}, status: 500
  end

  def index

  end

  def extractors
    @extractors = YoutubeDL.extractors
    @extractors.push("WWE")
    @extractors.sort!

    render json: @extractors
  end

  def create
    url = params[:url]
    info = YoutubeDL.info(url)

    render json: info
  end
end
