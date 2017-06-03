class Download < ApplicationRecord
  has_attached_file :thumbnail
  validates_attachment_content_type :thumbnail, content_type: /\Aimage\/.*\z/

  attr_accessor :description

  before_save :set_key

  private

  def set_key
    self.key ||= SecureRandom.hex
  end
end
