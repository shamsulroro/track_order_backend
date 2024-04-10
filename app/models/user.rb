require 'googleauth'
require 'googleauth/stores/file_token_store'
require 'microsoft_graph_auth'
require 'oauth2'

class User < ApplicationRecord
  has_many :devices, dependent: :destroy
  has_one :subscription, dependent: :destroy

  enum provider: { google: 0, outlook: 1 }

  after_commit :create_outlook_subscription, on: :create

  def update_access_token
    credentials_path = "#{Rails.root}/config/client_secrets.json"
    credentials = JSON.parse(File.read(credentials_path))['web']
    data = {
      :client_id => credentials['client_id'],
      :client_secret => credentials['client_secret'],
      :refresh_token => refresh_token,
      :project_id => credentials['project_id'],
      :scope => ['https://www.googleapis.com/auth/gmail.readonly'],
      :expires_in => 43199
    }
    authorizer = Google::Auth::UserRefreshCredentials.new(data)
    fetch_access_token = authorizer.fetch_access_token
    puts fetch_access_token
    new_access_token = fetch_access_token['access_token']
    update(access_token: new_access_token) if new_access_token
  end

  def update_outlook_access_tokens
    return unless provider == "outlook"

    parsed_auth_client = JSON.parse(auth_client).with_indifferent_access
    credentials = parsed_auth_client[:credentials]
   # Get the expiry time - 5 minutes
    expiry = Time.at(credentials[:expires_at] - 300)

    if Time.now > expiry
      # Token expired, refresh
      new_hash = outlook_refresh_tokens(credentials)
      update(access_token: new_hash['access_token'], refresh_token: new_hash['refresh_token'],
             token_expiry: new_hash['expires_at'])
    end
  end

  private

  def outlook_refresh_tokens(credentials)
    oauth_strategy = OmniAuth::Strategies::MicrosoftGraphAuth.new(
      nil, ENV.fetch('AZURE_APP_ID'), ENV.fetch('AZURE_APP_SECRET')
    )
    token = OAuth2::AccessToken.new(
      oauth_strategy.client, credentials[:token],
      refresh_token: credentials[:refresh_token]
    )
    # Refresh the tokens
    return token.refresh!.to_hash.slice(:access_token, :refresh_token, :expires_at)
  end

  def create_outlook_subscription
    return unless outlook?

    OutlookSubscription.new(self).create
  end
end
