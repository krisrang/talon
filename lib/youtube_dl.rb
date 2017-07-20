require 'open3'
require 'fileutils'
require 'tmpdir'

class YoutubeDL
  PATH = `which youtube-dl`.strip.freeze

  def self.ensure_exists!
    if !File.exist?(PATH)
      update!
    end
  end

  def self.update!
    run("-U")
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

  def self.download(url, filename, audio=false, timeout=60*60)
    target = File.join(Dir.tmpdir(), filename)
    error = nil
    lines = []
    cancel = {shouldcancel: false}
    progress = {
      percent: 0.0,
      size: 0.0,
      eta: 0
    }
    partname = nil
    audiopart = false
    merging = false

    command = [PATH,
      "-f",
      "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4/best",
      "--prefer-ffmpeg",
      "--no-continue",
      "--no-part",
      "--no-mtime",
      "-o", "#{target}.%(ext)s"]

    if audio
      command << "-x"
      command << "--audio-format"
      command << "mp3"
    else
      command << "--all-subs"
      command << "--write-sub"
      command << "--embed-subs"
    end

    command << "-v" if Rails.env.development?
    command << url
    
    Open3.popen3(*command) do |stdin, stdout, stderr, wait_thr|
      begin
        Timeout.timeout(timeout) do
          stdout.each("\r") do |line|
            lines << line

            if line.include?("[download]")
              # [download] Destination: Starfunkel - A Mixtape From Japan-E4s-hxY80pA.f133.mp4
              # [download]  10.1% of 9.89MiB at 43.57MiB/s ETA 00:00
              # [download]  10.1% of 9.89GiB at 43.57MiB/s ETA 00:00
              # [download]   0.1% of 9.89MiB at Unknown speed ETA Unknown ETA
              if line =~ /\[download\] (.*)% of (.*)(MiB|GiB) at (.*)MiB\/s ETA (.*):(.*)/
                progress[:percent] = $1.to_f
                progress[:size] = $2.to_f
                progress[:eta] = $5.to_i + $4.to_i * 60
              elsif line =~ /\[download\] (.*)% of (.*)(MiB|GiB) at Unknown/
                progress[:percent] = $1.to_f
                progress[:size] = $2.to_f
              elsif line =~ /\[download\] Destination: (.*)/
                if !partname.nil? && partname != $1
                  audiopart = true
                end
                
                partname = $1
              end
            end

            if line.include?("[ffmpeg] Merging formats")
              merging = true
            end
            
            yield(progress, audiopart, merging, cancel) if block_given?

            if cancel[:shouldcancel] == true
              Process.kill("INT", wait_thr.pid)
              cleanup(target)
              raise UserCancel
            end
          end

          error = stderr.read unless wait_thr.value.success?
        end
      rescue Timeout::Error
        Process.kill("INT", wait_thr.pid)
        cleanup(target)
        raise DownloadTimeout
      end
    end

    if error
      cleanup(target)
      raise RunError, error.strip 
    end
    
    [target, lines]
  end

  def self.cleanup(target)
    Dir["#{target}*"].each { |f| FileUtils.rm_f(f) }
  end

  def self.run(*args)
    output = ""
    error = nil

    command = [PATH, *args]
    Open3.popen3(*command) do |stdin, stdout, stderr, wait_thr|
      output = stdout.read unless stdout.nil?

      error = stderr.read unless wait_thr.value.success?
    end

    raise RunError, error.strip if error
    output.strip
  end

  class DownloadTimeout < StandardError; end
  class RunError < StandardError; end
  class UserCancel < StandardError; end
end
