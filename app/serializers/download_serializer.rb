class DownloadSerializer < ActiveModel::Serializer
  has_many :formats

  attributes :id, :url, :urlkey, :uuid, :title, :duration, :extractor, :thumbnail_url, :formats,
    :public_url, :filename, :percent, :progress_label, :lines, :audio,
    :initial, :started, :cancelled, :errored, :finished
  
  def uuid
    object.key
  end

  def thumbnail_url
    object.cached_thumbnail.present? ?
      object.cached_thumbnail.url : object.thumbnail ?
        object.thumbnail :
        ActionController::Base.helpers.asset_path("placeholder.png")
  end

  def lines
    if object.started? || object.errored?
      return object.lines
    end
    
    []
  end

  def filename
    object.public_filename
  end

  def initial; object.initial?; end
  def started; object.started?; end
  def cancelled; object.cancelled?; end
  def errored; object.errored?; end
  def finished; object.finished?; end
end
