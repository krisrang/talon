class FormatSerializer < ActiveModel::Serializer
  attributes :id, :ext, :width, :height, :abr, :description, :vcodec, :acodec, :video, :audio

  def video
    object.video?
  end

  def audio
    object.audio?
  end
end
