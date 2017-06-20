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

  def self.download(url, filename, timeout=60*60)
    target = File.join(Dir.tmpdir(), filename)
    error = nil
    cancel = false
    progress = {
      percent: 0.0,
      size: 0.0,
      eta: 0
    }
    partname = ""

    command = [PATH,
      "--prefer-ffmpeg",
      "--no-continue",
      "--no-part",
      "--no-mtime",
      "--all-subs",
      "--write-sub",
      "--embed-subs",
      "-o", target,
      url]
    Open3.popen3(*command) do |stdin, stdout, stderr, wait_thr|
      begin
        Timeout.timeout(timeout) do
          stdout.each("\r") do |line|
            if line.include?("[download]")
              # [download] Destination: Starfunkel - A Mixtape From Japan-E4s-hxY80pA.f133.mp4
              # [download]  10.1% of 9.89MiB at 43.57MiB/s ETA 00:00
              # [download]   0.1% of 9.89MiB at Unknown speed ETA Unknown ETA
              if line =~ /\[download\] (.*)% of (.*)MiB at (.*)MiB\/s ETA (.*):(.*)/
                progress[:percent] = $1.to_f
                progress[:size] = $2.to_f
                progress[:eta] = $5.to_i + $4.to_i * 60
              elsif line =~ /\[download\] (.*)% of (.*)MiB at Unknown/
                progress[:percent] = $1.to_f
                progress[:size] = $2.to_f
              elsif line =~ /\[download\] Destination: (.*)/
                partname = $1
              end
            end

            yield(progress, partname, line.split("\n"), cancel) if block_given?
            Process.kill("INT", wait_thr.pid) if cancel
          end

          error = stderr.read unless wait_thr.value.success?
        end
      rescue Timeout::Error
        Process.kill("INT", wait_thr.pid)
        Dir["#{target}*"].each { |f| FileUtils.rm_f(f) }
        raise DownloadTimeout
      end
    end

    if error
      Dir["#{target}*"].each { |f| FileUtils.rm_f(f) }
      raise RunError, error.strip 
    end
    
    target
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
end
