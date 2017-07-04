require_relative 'boot'

require 'rails/all'
require 'active_support/dependencies'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Talon
  class Application < Rails::Application
    require 'talon'

    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.log_tags  = [:subdomain, :uuid]
    config.logger    = ActiveSupport::TaggedLogging.new(logger)

    # Action mailer settings.
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:  "smtp-relay.gmail.com",
      port:     587
    }

    # Set Redis as the back-end for the cache.
    config.cache_store = :redis_store, "#{ENV['REDIS_URL']}/0/cache"
    $redis = Redis::Store::Factory.create(ENV['REDIS_URL'])

    # Set Sidekiq as the back-end for Active Job.
    config.active_job.queue_adapter = :sidekiq

    # Action Cable setting to allow connections from these domains.
    config.action_cable.allowed_request_origins = [
      /http:\/\/localhost*/,
      /http(s?):\/\/talon.dev.rang.ee/,
      /http(s?):\/\/talon.rang.ee/
    ]

    # per https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet
    config.pbkdf2_iterations = 64000
    config.pbkdf2_algorithm = "sha256"

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
