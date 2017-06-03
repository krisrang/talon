Paperclip::Attachment.default_options[:storage] = :fog
Paperclip::Attachment.default_options[:fog_directory] = "talon-ny-thumbs"

if Rails.env.production?
  Paperclip::Attachment.default_options[:fog_credentials] = { provider: "Google", google_storage_access_key_id: ENV['GOOGLE_KEY'], google_storage_secret_access_key: ENV['GOOGLE_SECRET']}
else
  Paperclip::Attachment.default_options[:fog_credentials] = { provider: "Local", local_root: "#{Rails.root}/public"}
  Paperclip::Attachment.default_options[:fog_host] = "http://localhost:3000"
end
