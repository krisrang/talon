class CreateUserAuthTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :user_auth_tokens do |t|
      t.integer :user_id, null: false
      t.string :auth_token, null: false
      t.string :prev_auth_token, null: false
      t.string :user_agent
      t.boolean :auth_token_seen, null: false, default: false
      t.inet :client_ip
      t.datetime :rotated_at
      t.datetime :seen_at

      t.timestamps

      t.index :auth_token, unique: true
      t.index :prev_auth_token, unique: true
    end
  end
end
