class Download < ApplicationRecord
  has_attached_file :thumbnail
  validates_attachment_content_type :thumbnail, content_type: /\Aimage\/.*\z/

  attr_accessor :description

  before_save :set_key

  def self.find_by_id_or_key(param)
    return Download.where(key: param).first if param.length == 32
    Download.where(id: param).first
  end

  private

  def set_key
    self.key ||= SecureRandom.hex
  end
end
