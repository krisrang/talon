class AddStatusFieldsToDownloads < ActiveRecord::Migration[5.1]
  def change
    add_column :downloads, :percent, :float
    add_column :downloads, :progress_label, :string
    add_column :downloads, :lines, :text
  end
end
