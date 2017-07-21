MessageBus.user_id_lookup do |env|
  user = CurrentUser.lookup_from_env(env)
  user && user.id
end

MessageBus.redis_config = {url: ENV['REDIS_URL']}
MessageBus.cache_assets = !Rails.env.development?
MessageBus.enable_diagnostics

if Rails.env == "test" || $0 =~ /rake$/
  # disable keepalive in testing
  MessageBus.keepalive_interval = -1
end
