Rails.application.routes.draw do
  get 'home/authenticate'
  get 'home/privacy_policy'
  get 'home/term_of_service'
  get 'oauth2callback', to: 'home#google_oauth2callback'
  post 'google_email_webhook', to: 'home#google_email_webhook'
  post 'outlook_email_webhook', to: 'home#outlook_email_webhook'
  match '/auth/:provider/callback', to: 'auth#callback', via: [:get, :post]
  resources :devices, only: [:create]

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "home#authenticate"
end
