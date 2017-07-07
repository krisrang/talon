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

  resources :users
  get "/users/activate/:token" => "users#activate", as: :activate_user
  get "/users/password-reset/:token" => "users#password_reset", as: :password_reset_user
  put "/users/password-reset/:token" => "users#password_reset"

  resource :session, only: [:create, :destroy] do
    collection do
      post "forgot_password"
    end
  end

  # React router routes
  get '/login' => 'sessions#new', as: :login
  get '/register' => 'users#new', as: :register

  get '/admin' => 'admin#index'
  post '/admin/youtubedl_update' => 'admin#youtubedl_update'

  root to: 'downloads#index'
end
