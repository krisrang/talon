require 'digest/sha1'
require 'fileutils'
require_dependency 'youtube_dl'

class Download < ApplicationRecord
  has_attached_file :cached_thumbnail
  validates_attachment_content_type :cached_thumbnail, content_type: /\Aimage\/.*\z/

  attr_accessor :formats, :last_progress

  before_save :set_key
  before_save :cache_thumbnail

  def self.find_by_id_or_key(param)
    return Download.where(key: param).first if param.length == 32
    Download.where(id: param).first
  end

  def self.from_info(url)
    key = Digest::SHA2.hexdigest(url)
    info = Rails.cache.fetch(key, expires_in: 10.minute) do
      YoutubeDL.info(url)
    end
    
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

  def progress(progress, partname)
    if !last_progress
      broadcast(progress_label: "Downloading video", progress: progress)
    elsif last_progress[:percent] > progress[:percent]
      broadcast(progress_label: "Downloading audio", progress: progress)
    else
      broadcast(progress: progress)
    end

    self.last_progress = progress
  end

  def error(err)
    broadcast(error: err)
  end

  def upload(path)
    broadcast(progress_label: "Uploading to storage...", progress: last_progress)

    ext = File.extname(path)
    disposition = "attachment; filename=\"#{self.title}#{ext}\""
    file = fog_directory.files.new({
      key: self.key,
      body: File.open(path),
      metadata: {
        "Content-Disposition" => disposition
      },
      public: true
    })
    file.save
    FileUtils.rm(path)

    broadcast(url: public_url)
  end

  def public_url
    @public_url ||= fog_directory.files.get(self.key).public_url
  end

  def broadcast(data={})
    ActionCable.server.broadcast("downloads_#{self.key}", data)
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

  def fog_connection
    @fog_connection ||= Fog::Storage.new(fog_credentials)
  end

  def fog_directory
    dir = "talon-ny"
    @fog_directory ||= fog_connection.directories.get(dir) || fog_connection.directories.create(dir)
  end

  def fog_credentials
    if true#Rails.env.production?
      return {provider: "Google", google_storage_access_key_id: ENV['GOOGLE_KEY'], google_storage_secret_access_key: ENV['GOOGLE_SECRET']}
    end
    
    {provider: "Local", local_root: "#{Rails.root}/public", endpoint: "http://localhost:3000"}
  end
end
