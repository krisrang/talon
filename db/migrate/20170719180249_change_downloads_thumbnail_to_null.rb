class ChangeDownloadsThumbnailToNull < ActiveRecord::Migration[5.1]
  def change
    change_column :downloads, :thumbnail, :string, null: true
  end
end
