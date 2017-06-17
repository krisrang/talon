class DownloadChannel < ApplicationCable::Channel
  def subscribed
    stream_from "downloads_#{params[:key]}"
  end

  # def unsubscribed
  # end
end
