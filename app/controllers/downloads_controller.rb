class DownloadsController < ApplicationController
  skip_before_action :verify_authenticity_token

  rescue_from YoutubeDL::RunError do |e|
    render json: {error: e.message}, status: 422
  end

  def index

  end

  def extractors
    @extractors = YoutubeDL.extractors.push("WWE Network").sort_by { |e| e[0].downcase }

    render json: @extractors
  end

  def create
    url = params[:url]
    fields = %w(thumbnail duration title extractor webpage_url description)
    info = YoutubeDL.info(url).slice(*fields)

    if !params[:start]
      return render json: info
    end

    download = Download.new(info)
    if download.save
      render json: download.attributes.merge(thumbnail: download.thumbnail.url)
    else
      render json: {error: download.errors}
    end
  end
end
