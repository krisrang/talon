require 'digest/sha1'
require 'fileutils'
require_dependency 'youtube_dl'

class Download < ApplicationRecord
  belongs_to :user
  
  has_attached_file :cached_thumbnail
  validates_attachment_content_type :cached_thumbnail, content_type: /\Aimage\/.*\z/

  attr_accessor :formats, :last_broadcast, :last_percent
  serialize :lines, Array
  enum status: { initial: 0, started: 1, cancelled: 2, errored: 3, finished: 4 }

  before_save :set_key
  before_save :cache_thumbnail
  # before_save :parse_lines
  before_destroy :delete_file

  scope :ordered, ->{ order(created_at: :desc) }

  def self.find_by_id_or_key(param)
    return Download.where(key: param).first if param.to_s.length == 32
    Download.where(id: param).first
  end

  def self.load_info(url)
    return YoutubeDL.info(url) if Rails.env.test?

    urlkey = Digest::SHA2.hexdigest(url)
    Rails.cache.fetch(urlkey, expires_in: 12.hours) do
      YoutubeDL.info(url)
    end
  end

  def self.from_info(url)
    info = load_info(url)
    
    self.new.tap do |download|
      download.url = info["webpage_url"]
      download.thumbnail = info["thumbnail"]
      download.duration = info["duration"]
      download.title = info["title"]
      download.extractor = info["extractor"]
      download.description = info["description"]

      download.formats = (info["formats"] || []).sort_by do |f|
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

  def urlkey
    Digest::SHA2.hexdigest(url)
  end

  def queue
    DownloadJob.perform_async(self.id)
  end

  def progress(progress, audio, merging)
    now = Time.now.to_f
    newpercent = progress[:percent].round

    if newpercent == self.last_percent
      return
    end

    self.percent = audio ? 100 : newpercent
    self.save
  
    broadcast(progress: percent)
    self.last_broadcast = now
    self.last_percent = newpercent
  end

  def error(err)
    return if err.kind_of? YoutubeDL::UserCancel
    
    self.errored!
    broadcast(error: err)    
    Raven.capture_exception(err)
  end

  def upload(path, log=nil)
    broadcast(progress_label: "Saving to storage...")

    self.update_column(:lines, log) if log

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

    if self.email
      DownloadMailer.complete(self.id, email).deliver_later
    end

    broadcast(public_url: public_url)
  end

  def public_url
    return if !self.filename
    bucket = ENV['DOWNLOADS_BUCKET']

    if Rails.env.production?
      return "https://storage.googleapis.com/#{bucket}/#{self.filename}"
    end
    
    "http://localhost:3000/#{bucket}/#{self.filename}"
  end

  def broadcast(data={})
    DownloadChannel.broadcast_to(self, data)
  end

  def cancel!
    self.update_column(:percent, 0)
    self.update_column(:lines, [])
    self.cancelled!
    broadcast(cancel: true)
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
    @fog_directory ||= fog_connection.directories.get(dir) || fog_connection.directories.create(key: dir)
  end

  def fog_credentials
    if Rails.env.production?
      return {provider: "Google", google_storage_access_key_id: ENV['GOOGLE_KEY'], google_storage_secret_access_key: ENV['GOOGLE_SECRET']}
    end
    
    {provider: "Local", local_root: "#{Rails.root}/public", endpoint: "http://localhost:3000"}
  end

  def parse_lines
    if lines_changed?
      cr = false

      self.lines = self.lines.map do |line|
        if cr === true
          cr = false
          nil
        else
          crindex = line.index("\r")
          cr = !crindex.nil?
          line.gsub("\r", "")
        end.reject(&:nil?)
      end
    end
  end
end
