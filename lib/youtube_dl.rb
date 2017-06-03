require "fileutils"
require "open-uri"
require "net/http"
require "open3"

class YoutubeDL
  PATH = Rails.root.join("bin", "youtube-dl").freeze
  URL = "https://yt-dl.org/downloads/latest/youtube-dl".freeze

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
    version
  end

  def self.version
    run("--version")
  end

  def self.extractors
    run("--list-extractors").split("\n").map { |e| e.split(":")[0] }.uniq
  end

  def self.info(url)
    JSON.parse(run("-j", url))
  end

  def self.run(*args)
    output = ""
    error = nil

    command = [PATH.to_s, *args]
    Open3.popen3(*command) do |stdin, stdout, stderr, wait_thr|
      output = stdout.read unless stdout.nil?

      error = stderr.read unless wait_thr.value.success?
    end

    raise RunError, error.strip if error
    output.strip
  end

  class RunError < StandardError; end
end
