class DownloadSerializer < ActiveModel::Serializer
  attributes :id, :duration, :extractor, :key, :title, :webpage_url, :thumbnail_url

  def thumbnail_url
    object.thumbnail.url
  end
end
