class ChangeDescriptionOnDownloads < ActiveRecord::Migration[5.1]
  def change
    change_column :downloads, :description, :string, null: true
  end
end
