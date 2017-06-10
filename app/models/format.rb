class Format < ActiveModelSerializers::Model
  attr_accessor :id, :ext, :width, :height, :description, :abr, :vcodec, :acodec

  def initialize(format)
    @id = format["format_id"]
    @ext = format["ext"]
    @width = format["width"]
    @height = format["height"]
    @abr = format["abr"]
    @description = format["format"]
    @vcodec = format["vcodec"]
    @acodec = format["acodec"]
  end

  def video?
    @vcodec != "none"
  end

  def audio?
    @acodec != "none"
  end
end
