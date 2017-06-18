class AddFilenameToDownloads < ActiveRecord::Migration[5.1]
  def change
    add_column :downloads, :filename, :string
  end
end
