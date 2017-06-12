require 'digest/sha1'
require_dependency 'youtube_dl'

class Download < ApplicationRecord
  has_attached_file :cached_thumbnail
  validates_attachment_content_type :cached_thumbnail, content_type: /\Aimage\/.*\z/

  attr_accessor :formats

  before_save :set_key
  before_save :cache_thumbnail

  def self.find_by_id_or_key(param)
    return Download.where(key: param).first if param.length == 32
    Download.where(id: param).first
  end

  def self.from_info(url)
    info = {}
    key = Digest::SHA2.hexdigest(url)
    Rails.cache.fetch(key, expires_in: 10.minute) do
      info = YoutubeDL.info(url)
    end
    
    download = self.new

    download.url = info["webpage_url"]
    download.thumbnail = info["thumbnail"]
    download.duration = info["duration"]
    download.title = info["title"]
    download.extractor = info["extractor"]
    download.description = info["description"]

    download.formats = info["formats"].sort_by do |f|
      if f["width"] && f["width"] > 0
        f["width"] * f["height"]
      else
        f["abr"]
      end
    end.reverse.map { |f| Format.new(f) }

    download
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
end
