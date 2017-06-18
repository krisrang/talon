class DownloadsController < ApplicationController
  skip_before_action :verify_authenticity_token

  rescue_from YoutubeDL::RunError do |e|
    Raven.capture_exception(e)
    render json: {error: e.message}, status: 422
  end

  def index
    # keys = download_keys

    # @downloads = Download.where(key: keys)
    # cookies.permanent.signed[:downloads] = JSON.dump(@downloads.map(&:key))

    # @download_json = ActiveModelSerializers::SerializableResource.new(@downloads)
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

    if !params[:start]
      return render json: download
    end

    if download.save
      # remember_download(download)
      download.queue
      render json: download
    else
      render json: {error: download.errors}
    end
  end

  def destroy
    @download = Download.find_by_id_or_key(params[:id])
    @download.destroy

    render json: {success: true}
  end

  private

  def download_keys
    return JSON.parse(cookies.permanent.signed[:downloads]) if cookies.permanent.signed[:downloads]
    []
  rescue JSON::ParserError
  end

  def remember_download(download)
    keys = download_keys
    cookies.permanent.signed[:downloads] = JSON.dump(keys.push(download.key))
  end

  def valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) && !uri.host.nil?
  rescue URI::InvalidURIError
    false
  end
end
