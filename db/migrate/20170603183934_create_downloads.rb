class CreateDownloads < ActiveRecord::Migration[5.1]
  def change
    create_table :downloads do |t|
      t.string :key, :title, :extractor, :webpage_url, null: false
      t.integer :duration

      t.attachment :thumbnail

      t.timestamps

      t.index :key
      t.index :webpage_url
    end
  end
end
