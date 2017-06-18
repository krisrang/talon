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
gem 'webpacker'
gem 'font-awesome-rails'
gem 'jquery-rails'
gem 'bootstrap-sass'

gem 'redis-rails', '~> 5.0.0.pre'
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

group :development, :test do
  gem 'byebug', platform: :mri
  gem 'capybara'
  gem 'selenium-webdriver'
end

group :development do
  gem 'web-console'
  gem 'listen'
  gem 'spring'
  gem 'spring-watcher-listen'
end
