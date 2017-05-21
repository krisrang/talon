require "fileutils"
require "open-uri"
require "net/http"

class YoutubeDL
  PATH = Rails.root.join("bin", "youtube-dl")
  URL = "https://yt-dl.org/downloads/latest/youtube-dl"

  def self.version
    ensure_exists!
    `#{PATH} --version`
  end

  def self.ensure_exists!
    if !File.exist?(PATH)
      url = URI(URL)
      options = {"User-Agent" => "talonrb"}
      file = url.open(options)
      IO.copy_stream(file, PATH)
      File.chmod(0777, PATH)
    end
  end
end
