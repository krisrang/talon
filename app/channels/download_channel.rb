class DownloadChannel < ApplicationCable::Channel
  def subscribed
    stream_from "downloads_#{params[:key]}"
  end

  def cancel
    download = Download.where(key: params[:key]).first
    download.cancel!
  end
end
