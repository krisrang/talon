module FFMPEG
  def self.version
    version_full.split(/\r|\n/)[0].match(/ffmpeg version (\S+)/)
  end

  def self.version_full
    `#{FFMPEG.ffmpeg_binary} -version`
  end
end
