module Talon
  def self.instance_id
    @@instance_id ||= SecureRandom.hex
  end
end
