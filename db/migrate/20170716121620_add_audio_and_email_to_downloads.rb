class AddAudioAndEmailToDownloads < ActiveRecord::Migration[5.1]
  def change
    add_column :downloads, :audio, :boolean, default: false
    add_column :downloads, :email, :string
  end
end
