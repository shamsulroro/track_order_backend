require 'omniauth-oauth2'

module OmniAuth
  module Strategies
    # Implements an OmniAuth strategy to get a Microsoft Graph
    # compatible token from Azure AD
    class MicrosoftGraphAuth < OmniAuth::Strategies::OAuth2
      option :name, :microsoft_graph_auth

      DEFAULT_SCOPE = "openid profile email offline_access User.Read mailboxsettings.read Mail.ReadBasic Mail.Read Directory.Read.All"

      # Configure the Microsoft identity platform endpoints
      option :client_options,
             site: 'https://login.microsoftonline.com',
             authorize_url: '/common/oauth2/v2.0/authorize',
             token_url: '/common/oauth2/v2.0/token'

      option :pcke, true
      # Send the scope parameter during authorize
      option :authorize_options, [:scope]

      # Unique ID for the user is the id field
      uid { raw_info['id'] }

      # Get additional information after token is retrieved
      extra do
        {
          'raw_info' => raw_info
        }
      end

      def raw_info
        # Get user profile information from the /me endpoint
        # @raw_info ||= HTTParty.get("https://graph.microsoft.com/v1.0/me", :headers => {
        #   "Content-Type" => "application/json",
        #   "Authorization" => "Bearer #{access_token.response.parsed[:access_token]}"
        # }).with_indifferent_access
        @raw_info ||= access_token.get('https://graph.microsoft.com/v1.0/me?$select=displayName,mail,mailboxSettings,userPrincipalName').parsed
      end

      def authorize_params
        super.tap do |params|
          params[:scope] = request.params['scope'] if request.params['scope']
          params[:scope] ||= DEFAULT_SCOPE
        end
      end

      # Override callback URL
      # OmniAuth by default passes the entire URL of the callback, including
      # query parameters. Azure fails validation because that doesn't match the
      # registered callback.
      def callback_url
        options[:redirect_uri] || (full_host + script_name + callback_path)
      end
    end
  end
end
