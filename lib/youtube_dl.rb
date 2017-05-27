require "fileutils"
require "open-uri"
require "net/http"

module YoutubeDL
  PATH = Rails.root.join("bin", "youtube-dl").freeze
  URL = "https://yt-dl.org/downloads/latest/youtube-dl".freeze

  def self.version
    `#{PATH} --version`.strip
  end

  def self.ensure_exists!
    if !File.exist?(PATH)
      update!
    end
  end

  def self.update!
    url = URI(URL)
    options = {"User-Agent" => "talonrb"}
    file = url.open(options)
    IO.copy_stream(file, PATH)
    File.chmod(0777, PATH)
    @@extractors = nil
  end

  def self.extractors
    @@extractors ||= `#{PATH} --list-extractors`.strip.split.map { |e| e.split(":")[0] }.uniq
  end
end
