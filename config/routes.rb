require 'sidekiq/web'

Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  resources :downloads do
    collection do
      get :extractors
    end
  end

  get '/admin' => 'admin#index'
  post '/admin/youtubedl_update' => 'admin#youtubedl_update'

  root to: 'downloads#index'
end
