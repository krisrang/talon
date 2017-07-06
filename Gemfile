source 'https://rubygems.org'
ruby '2.4.1'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '~> 5.1.1'
gem 'pg'
gem 'puma'
gem 'sass-rails'
gem 'uglifier'
gem 'webpacker', github: 'rails/webpacker', ref: 'b8e3873c921baf23de4c28caaaba6dae26adb0b9'
gem 'font-awesome-rails'
gem 'jquery-rails'
gem 'bootstrap-sass'

gem 'hiredis'
gem 'redis', require:  ["redis", "redis/connection/hiredis"]
gem 'redis-rails', '~> 5.0.0'
gem 'sidekiq'
gem 'httparty'
gem 'm3u8'
gem 'rack-mini-profiler', require: false
gem 'streamio-ffmpeg'
gem 'message_bus'
gem 'paperclip'
gem 'fog-google'
gem 'fog-local'
gem 'active_model_serializers'
gem 'sentry-raven'
gem 'rufus-scheduler'
gem 'fast_xor'

group :development, :test do
  gem 'byebug', platform: :mri
  gem 'capybara'
  gem 'selenium-webdriver'
  gem 'chromedriver-helper'
  gem 'rspec-rails'
  gem 'fabrication'
  gem 'shoulda-matchers', github: 'thoughtbot/shoulda-matchers', branch: 'rails-5'
  gem 'bundle-audit'
  gem 'rspec_junit_formatter'
end

group :test do
  gem 'timecop'
  gem 'mocha'
end

group :development do
  gem 'web-console'
  gem 'listen'
  gem 'spring'
  gem 'spring-watcher-listen'
end
