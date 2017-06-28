require_dependency "youtube_dl"

class DownloadJob
  include Sidekiq::Worker

  def perform(id)
    download = Download.find(id)
    download.started!
    
    target = YoutubeDL.download(download.url, download.key) do |progress, audio, merging, lines, cancel|
      download.progress(progress, lines, audio, merging)
    end

    target = Dir["#{target}.*"].first
    download.upload(target)
  rescue StandardError => e
    download.error(e)
  end 
end
