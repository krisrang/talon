class DownloadsController < ApplicationController
  skip_before_action :verify_authenticity_token

  rescue_from YoutubeDL::RunError do |e|
    Raven.capture_exception(e)
    render json: {error: e.message}, status: 422
  end

  def index
    # Download.all.destroy_all

    @downloads = Download.order("created_at").all
    @download_json = ActiveModelSerializers::SerializableResource.new(@downloads)
  end

  def extractors
    @extractors = Rails.cache.fetch("youtubedl-extractors") do
      # YoutubeDL.extractors.push("WWE Network").sort_by { |e| e[0].downcase }
      YoutubeDL.extractors.sort_by { |e| e[0].downcase }
    end

    render json: @extractors
  end

  def create
    url = params[:url]
    if !valid_url?(url)
      return render json: {error: "Invalid URL, please check your spelling"}, status: 422
    end
    
    download = Download.from_info(url)

    if download.save
      render json: download
    else
      render json: {error: download.errors}
    end
  end

  def start
    download = Download.find_by_id_or_key(params[:id])
    download.queue
    render json: download
  end

  def destroy
    @download = Download.find_by_id_or_key(params[:id])
    @download.destroy
    render json: {success: true}
  end

  private

  def valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) && !uri.host.nil?
  rescue URI::InvalidURIError
    false
  end
end
