require 'sidekiq/web'

Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  get '/admin' => 'admin#index'
  post '/admin/youtubedl_update' => 'admin#youtubedl_update'

  root to: 'downloads#intro'
end
