class AuthController < ApplicationController

  def callback
    # Access the authentication hash for omniauth
    @auth_hash = request.env['omniauth.auth']
    @token_hash = @auth_hash[:credentials]
    @user_name = @auth_hash.dig(:extra, :raw_info, :displayName)
    @user_email = @auth_hash.dig(:extra, :raw_info, :mail) ||
                           @auth_hash.dig(:extra, :raw_info, :userPrincipalName)
    @user_timezone = @auth_hash.dig(:extra, :raw_info, :mailboxSettings, :timeZone)

    @refresh_token = @token_hash[:refresh_token]

    user = User.find_by( email:  @user_email )
    if user
      user.update(auth_client: @auth_hash.to_json, access_token: access_token, refresh_token: @refresh_token, token_expiry: Time.at(@token_hash[:expires_at]), provider: 'outlook' )
    else
      User.create(email: @user_email, auth_client:  @auth_hash.to_json, access_token: access_token, refresh_token: @refresh_token, token_expiry: Time.at(@token_hash[:expires_at]), provider: 'outlook' )
    end

    redirect_to root_url, notice: 'Succesfully Authenticated'
  end

  private

  def access_token
    return if @token_hash.nil?

    # Get the expiry time - 5 minutes
    expiry = Time.at(@token_hash[:expires_at] - 300)

    if Time.now > expiry
      # Token expired, refresh
      new_hash = refresh_tokens @token_hash
      new_hash[:token]
    else
      @token_hash[:token]
    end
  end

  def refresh_tokens
    oauth_strategy = OmniAuth::Strategies::MicrosoftGraphAuth.new(
      nil, ENV.fetch('AZURE_APP_ID'), ENV.fetch('AZURE_APP_SECRET')
    )

    token = OAuth2::AccessToken.new(
      oauth_strategy.client, @token_hash[:token],
      refresh_token: @token_hash[:refresh_token]
    )

    # Refresh the tokens
    new_tokens = token.refresh!.to_hash.slice(:access_token, :refresh_token, :expires_at)

    # Rename token key
    new_tokens[:token] = new_tokens.delete :access_token
    # Store the new hash
    @refresh_token = new_tokens[:refresh_token]
    @token_hash = new_tokens
  end
end
