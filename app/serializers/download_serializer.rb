class DownloadSerializer < ActiveModel::Serializer
  has_many :formats

  attributes :id, :url, :uuid, :title, :duration, :extractor, :thumbnail_url, :formats,
    :public_url, :percent, :progress_label, :lines,
    :initial, :started, :cancelled, :errored, :finished
  
  def uuid
    object.key
  end

  def thumbnail_url
    object.cached_thumbnail.present? ? object.cached_thumbnail.url : object.thumbnail
  end

  def lines
    if object.started? || object.errored?
      return object.lines
    end
    
    []
  end

  def initial; object.initial?; end
  def started; object.started?; end
  def cancelled; object.cancelled?; end
  def errored; object.errored?; end
  def finished; object.finished?; end
end
