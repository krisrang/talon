class DownloadChannel < ApplicationCable::Channel
  def subscribed
    if download = current_user.downloads.find(params[:id])
      stream_for download
    else
      reject
    end
  end

  def cancel
    current_user.downloads.find(params[:id]).cancel!
  end
end
