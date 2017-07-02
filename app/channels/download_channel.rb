class DownloadChannel < ApplicationCable::Channel
  def subscribed
    stream_from "downloads_#{params[:id]}"
  end

  def cancel
    download = Download.find_by_id_or_key(params[:id])
    download.cancel!
  end
end
