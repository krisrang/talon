require_dependency "youtube_dl"

class DownloadJob
  include Sidekiq::Worker

  def perform(id)
    shouldcancel = false
    cancelproc = Proc.new { |msg| shouldcancel = true if msg.data["id"] == id && msg.data["cancel"] == true }

    download = Download.find(id)
    download.started!    

    MessageBus.subscribe("/cancel", &cancelproc)
    
    target = YoutubeDL.download(download.url, download.key) do |progress, audio, merging, lines, cancel|
      cancel[:shouldcancel] = true if shouldcancel      
      download.progress(progress, lines, audio, merging)
    end

    target = Dir["#{target}.*"].first
    download.upload(target)
  rescue ActiveRecord::RecordNotFound
    # do nothin
  rescue StandardError => e
    download.error(e)
  ensure
    MessageBus.unsubscribe("/cancel", &cancelproc)
  end 
end
