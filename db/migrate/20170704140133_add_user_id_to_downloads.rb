class AddUserIdToDownloads < ActiveRecord::Migration[5.1]
  def change
    add_column :downloads, :user_id, :integer, null: false
    add_index :downloads, :user_id
  end
end
