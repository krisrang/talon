require 'rack-mini-profiler'
Rack::MiniProfilerRails.initialize!(Rails.application)

uri = URI.parse(ENV["REDIS_URL"])
Rack::MiniProfiler.config.storage_options = { :host => uri.host, :port => uri.port, :password => uri.password }
Rack::MiniProfiler.config.storage = Rack::MiniProfiler::RedisStore

# without a user provider our results will use the ip address for namespacing
#  with a load balancer in front this becomes really bad as some results can
#  be stored associated with ip1 as the user and retrieved using ip2 causing 404s
Rack::MiniProfiler.config.user_provider = lambda do |env|
  request = Rack::Request.new(env)
  id = request.cookies["_t"] || request.ip || "unknown"
  id = id.to_s
  # some security, lets not have these tokens floating about
  Digest::MD5.hexdigest(id)
end

Rack::MiniProfiler.config.pre_authorize_cb = lambda do |env|
  (env['HTTP_USER_AGENT'] !~ /iPad|iPhone|Nexus 7|Android/) &&
  (env['PATH_INFO'] !~ /sidekiq/) &&
  (env['PATH_INFO'] !~ /logs/) &&
  (env['PATH_INFO'] !~ /image\/get/) &&
  (env['PATH_INFO'] !~ /talon-.*-thumbs/) &&
  (env['PATH_INFO'] !~ /cable/) &&
  (env['PATH_INFO'] !~ /message-bus/) &&
  (env['PATH_INFO'] !~ /favicon.ico/)
end

Rack::MiniProfiler.config.position = 'right'
Rack::MiniProfiler.config.backtrace_ignores ||= []
Rack::MiniProfiler.config.backtrace_ignores << /lib\/rack\/message_bus.rb/
# Rack::MiniProfiler.config.backtrace_ignores << /config\/initializers\/quiet_logger/
