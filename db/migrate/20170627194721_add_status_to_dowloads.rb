class AddStatusToDowloads < ActiveRecord::Migration[5.1]
  def change
    add_column :downloads, :status, :integer, default: 0
  end
end
