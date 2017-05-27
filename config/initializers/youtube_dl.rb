require_dependency 'youtube_dl'

MessageBus.subscribe "/youtubedl-update" do |msg|
  next if Rails.env.development? || msg.data == Talon.instance_id

  Rails.logger.info "Updating youtube-dl"
  YoutubeDL.update!
  Rails.logger.info "New version: #{YoutubeDL.version}"
end
