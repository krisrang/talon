task dltest: :environment do
  require_dependency 'youtube_dl'
  YoutubeDL.download("https://www.youtube.com/watch?v=Oto9puRcktg&feature=youtu.be", "~/Downloads/test") do |progress, partname|
    p "#{progress} #{partname}"
  end
end
