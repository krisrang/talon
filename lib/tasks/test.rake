task dltest: :environment do
  require_dependency 'youtube_dl'
  d = Download.last
  YoutubeDL.download(d.url, d.key) do |progress, partname|
    p "#{progress} #{partname}"
  end
end
