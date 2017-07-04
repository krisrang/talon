require 'sidekiq/web'
require_dependency "admin_constraint"

Rails.application.routes.draw do
  if Rails.env.development?
    mount Sidekiq::Web => "/sidekiq"
  else
    mount Sidekiq::Web => "/sidekiq", constraints: AdminConstraint.new
  end

  resources :downloads do
    collection do
      get :extractors
    end
    member do
      post :start
    end
  end

  # React router routes
  get '/login' => 'downloads#index', as: :login

  get '/admin' => 'admin#index'
  post '/admin/youtubedl_update' => 'admin#youtubedl_update'

  root to: 'downloads#index'
end
