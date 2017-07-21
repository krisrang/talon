require_dependency "youtube_dl"

class DownloadJob
  include Sidekiq::Worker

  def perform(id)
    download = Download.find(id)
    download.started!
    
    target, log = YoutubeDL.download(download.url, download.key, download.audio) do |progress, audio, merging, cancel|
      cancel[:shouldcancel] = true if download.cancel?
      download.progress(progress, audio, merging)
    end

    target = Dir["#{target}.*"].first
    download.upload(target, log)
  rescue ActiveRecord::RecordNotFound
    # do nothin
  rescue StandardError => e
    download.error(e)
  end 
end
