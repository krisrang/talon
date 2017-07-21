class DownloadsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :require_user, only: [:start, :destroy]
  before_action :parse_url, only: [:info, :create]

  rescue_from YoutubeDL::RunError do |e|
    Raven.capture_exception(e)
    render_json_error(e.message)
  end

  def index
    @downloads = logged_in? ? current_user.downloads.ordered : []

    respond_to do |format|
      format.html do
        @preload = { downloads: serialize(@downloads) }
        render 'shared/client'
      end
      
      format.json { render json: @downloads }
    end
  end

  def extractors
    @extractors = Rails.cache.fetch("youtubedl-extractors") do
      # YoutubeDL.extractors.push("WWE Network").sort_by { |e| e[0].downcase }
      YoutubeDL.extractors.sort_by { |e| e[0].downcase }
    end

    respond_to do |format|
      format.html { render layout: 'static' }
      format.json { render json: @extractors }
    end
  end

  def info
    user = logged_in? ? current_user : create_shadow_user
    download = user.downloads.from_info(@url)
    render json: download
  end

  def create
    user = logged_in? ? current_user : create_shadow_user
    download = user.downloads.from_info(@url)
    download.audio = params[:audio]
    download.email = params[:email]

    if download.save
      download.queue
      render json: download
    else
      render json: {error: download.errors}
    end
  end

  def start
    download = current_user.downloads.find_by_id_or_key(params[:id])
    download.queue
    render json: download
  end

  def cancel
    download = current_user.downloads.find_by_id_or_key(params[:id])
    download.cancel!
    render json: {success: true}
  end

  def destroy
    @download = current_user.downloads.find_by_id_or_key(params[:id])
    @download.destroy
    render json: {success: true}
  end

  private

  def parse_url
    @url = params[:url]
    if !valid_url?(@url)
      return render json: {error: "Invalid URL, please check your spelling"}, status: 422
    end
  end

  def valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) && !uri.host.nil?
  rescue URI::InvalidURIError
    false
  end
end
