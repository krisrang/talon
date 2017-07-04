class CreateEmailTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :email_tokens do |t|
      t.integer :user_id, null: false
      t.string :email, null: false
      t.string :token, null: false
      t.boolean :confirmed, null: false, default: false
      t.boolean :expired, null: false, default: false
      
      t.timestamps

      t.index :token, unique: true
      t.index :user_id
    end
  end
end
