class DownloadSerializer < ActiveModel::Serializer
  has_many :formats

  attributes :id, :url, :key, :title, :duration, :extractor, :description, :thumbnail_url, :formats

  def thumbnail_url
    object.cached_thumbnail.present? ? object.cached_thumbnail.url : object.thumbnail
  end
end
