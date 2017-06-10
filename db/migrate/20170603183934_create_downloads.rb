class CreateDownloads < ActiveRecord::Migration[5.1]
  def change
    create_table :downloads do |t|
      t.string :url, :key, :title, :extractor, :description, :thumbnail, null: false
      t.integer :duration

      t.attachment :cached_thumbnail

      t.timestamps

      t.index :url
      t.index :key
    end
  end
end
