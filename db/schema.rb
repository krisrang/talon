# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170704093559) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "downloads", force: :cascade do |t|
    t.string "url", null: false
    t.string "key", null: false
    t.string "title", null: false
    t.string "extractor", null: false
    t.string "description"
    t.string "thumbnail", null: false
    t.integer "duration"
    t.string "cached_thumbnail_file_name"
    t.string "cached_thumbnail_content_type"
    t.integer "cached_thumbnail_file_size"
    t.datetime "cached_thumbnail_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "filename"
    t.integer "status", default: 0
    t.float "percent"
    t.string "progress_label"
    t.text "lines"
    t.index ["key"], name: "index_downloads_on_key"
    t.index ["url"], name: "index_downloads_on_url"
  end

  create_table "email_tokens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "email", null: false
    t.string "token", null: false
    t.boolean "confirmed", default: false, null: false
    t.boolean "expired", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_email_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_email_tokens_on_user_id"
  end

  create_table "user_auth_tokens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "auth_token", null: false
    t.string "prev_auth_token", null: false
    t.string "user_agent"
    t.boolean "auth_token_seen", default: false, null: false
    t.inet "client_ip"
    t.datetime "rotated_at"
    t.datetime "seen_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["auth_token"], name: "index_user_auth_tokens_on_auth_token", unique: true
    t.index ["prev_auth_token"], name: "index_user_auth_tokens_on_prev_auth_token", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", limit: 513, null: false
    t.string "password_hash", limit: 64, null: false
    t.string "salt", limit: 32, null: false
    t.string "api_key", limit: 64
    t.datetime "last_seen_at"
    t.inet "ip_address"
    t.boolean "active", default: false, null: false
    t.boolean "suspended", default: false, null: false
    t.boolean "admin", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin"], name: "index_users_on_admin"
    t.index ["api_key"], name: "index_users_on_api_key"
    t.index ["email"], name: "index_users_on_email"
  end

end
