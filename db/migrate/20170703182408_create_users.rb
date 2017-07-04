class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string :email, limit: 513#, null: false
      t.string :password_hash, limit: 64#, null: false
      t.string :salt, limit: 32#, null: false
      t.string :api_key, limit: 64
      t.datetime :last_seen_at
      t.inet :ip_address

      t.boolean :shadow, :active, :suspended, :admin, default: false, null: false

      t.timestamps

      t.index :admin
      t.index :email
      t.index :api_key
    end
  end
end
