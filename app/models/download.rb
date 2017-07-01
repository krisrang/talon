require 'digest/sha1'
require 'fileutils'
require_dependency 'youtube_dl'

class Download < ApplicationRecord
  has_attached_file :cached_thumbnail
  validates_attachment_content_type :cached_thumbnail, content_type: /\Aimage\/.*\z/

  attr_accessor :formats, :cr, :last_broadcast
  serialize :lines, Array
  enum status: { initial: 0, started: 1, cancelled: 2, errored: 3, finished: 4 }

  before_save :set_key
  before_save :cache_thumbnail
  before_destroy :delete_file

  def self.find_by_id_or_key(param)
    return Download.where(key: param).first if param.length == 32
    Download.where(id: param).first
  end

  def self.from_info(url)
    urlkey = Digest::SHA2.hexdigest(url)
    key = SecureRandom.hex
    info = Rails.cache.fetch(urlkey, expires_in: 30.minute) do
      YoutubeDL.info(url)
    end
    # info = YoutubeDL.info(url)
    
    self.new.tap do |download|
      download.key = key
      download.url = info["webpage_url"]
      download.thumbnail = info["thumbnail"]
      download.duration = info["duration"]
      download.title = info["title"]
      download.extractor = info["extractor"]
      download.description = info["description"]

      download.formats = info["formats"].sort_by do |f|
        if f["width"] && f["height"] && f["width"] > 0
          f["width"] * f["height"]
        elsif f["preference"] || f["abr"]
          f["preference"] || f["abr"]
        else
          0
        end
      end.reverse.map { |f| Format.new(f) }
    end
  end

  def queue
    DownloadJob.perform_async(self.id)
  end

  def progress(progress, newlines, audio, merging)
    self.lines ||= []

    newlines.each do |line|
      if (cr === true)
        self.lines.pop
        self.cr = false
      end

      crindex = line.index("\r")
      self.lines.push(line.gsub("\r", ""))
      self.cr = !crindex.nil?
    end

    now = Time.now.to_f
    if progress && progress[:percent] < 100 && now - (self.last_broadcast || 0) < 0.3
      return
    end

    label = merging ? "Merging audio and video" : audio ? "Downloading audio" : "Downloading video"

    self.percent = progress[:percent]
    self.progress_label = label
    self.lines = lines
    self.save
  
    broadcast(progress_label: "#{label} #{progress[:percent]}%", progress: progress, lines: lines)
    self.last_broadcast = now
  end

  def error(err)
    if err.kind_of? YoutubeDL::UserCancel
      self.cancelled!
      broadcast(cancel: true)
      return
    end
    
    self.errored!
    broadcast(error: err)    
    Raven.capture_exception(err)
  end

  def upload(path)
    broadcast(progress_label: "Saving to storage...")

    ext = File.extname(path)
    disposition = "attachment; filename=\"#{self.title}#{ext}\""
    filename = "#{self.key[0..7]}#{ext}"
    file = fog_directory.files.new({
      key: filename,
      body: File.open(path),
      metadata: {
        "Content-Disposition" => disposition
      },
      public: true
    })
    file.save
    FileUtils.rm(path)

    self.update_column(:filename, filename)
    self.finished!

    broadcast(public_url: public_url)
  end

  def public_url
    return if !self.filename
    bucket = ENV['DOWNLOADS_BUCKET']

    if Rails.env.production?
      return "https://storage.cloud.google.com/#{bucket}/#{self.filename}"
    end
    
    "http://localhost:3000/#{bucket}/#{self.filename}"
  end

  def broadcast(data={})
    ActionCable.server.broadcast("downloads_#{self.key}", data)
  end

  def cancel!
    MessageBus.publish("/cancel", {id: self.id, cancel: true})
  end

  private

  def set_key
    self.key ||= SecureRandom.hex
  end

  def cache_thumbnail
    if !cached_thumbnail.present? && thumbnail
      self.cached_thumbnail = thumbnail
    end
  end

  def delete_file
    return if !self.filename
    Rails.logger.info("Deleting download #{self.filename}")
    fog_directory.files.get(self.filename).destroy
  end

  def fog_connection
    @fog_connection ||= Fog::Storage.new(fog_credentials)
  end

  def fog_directory
    dir = ENV['DOWNLOADS_BUCKET']
    @fog_directory ||= fog_connection.directories.get(dir) || fog_connection.directories.create(dir)
  end

  def fog_credentials
    if Rails.env.production?
      return {provider: "Google", google_storage_access_key_id: ENV['GOOGLE_KEY'], google_storage_secret_access_key: ENV['GOOGLE_SECRET']}
    end
    
    {provider: "Local", local_root: "#{Rails.root}/public", endpoint: "http://localhost:3000"}
  end
end
