class DownloadChannel < ApplicationCable::Channel
  def subscribed
    stream_from "downloads_#{params[:]}"
  end

  # def unsubscribed
  # end
end
