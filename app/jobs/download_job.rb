require_dependency "youtube_dl"

class DownloadJob
  include Sidekiq::Worker

  def perform(id)
    download = Download.find(id)
    target = YoutubeDL.download(download.url, download.key) do |progress, partname|
      download.progress(progress, partname)
    end

    target = Dir["#{target}.*"].first
    download.upload(target)
  rescue YoutubeDL::RunError => e
    download.error(e)
  end 
end
