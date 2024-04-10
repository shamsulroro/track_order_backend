require "google/apis/gmail_v1"
require 'google/api_client/client_secrets'

class HomeController < ApplicationController
  skip_before_action :verify_authenticity_token

  def authenticate
    client_secrets = Google::APIClient::ClientSecrets.load("#{Rails.root}/config/client_secrets.json")
    auth_client = client_secrets.to_authorization
    auth_client.update!(
      :additional_parameters => {"access_type" => "offline", "include_granted_scopes" => "true"},
      :scope => 'https://www.googleapis.com/auth/gmail.readonly',
      :redirect_uri => oauth2callback_url)
      @auth_uri = auth_client.authorization_uri.to_s
      # redirect_to @auth_uri, allow_other_host: true
  end

  def privacy_policy

  end

  def term_of_service
  end

  def google_oauth2callback
    client_secrets = Google::APIClient::ClientSecrets.load("#{Rails.root}/config/client_secrets.json")
    auth_client = client_secrets.to_authorization
    auth_client.update!(
      :additional_parameters => {"access_type" => "offline", "include_granted_scopes" => "true"},
      :scope => 'https://www.googleapis.com/auth/gmail.readonly',
      :redirect_uri => oauth2callback_url)
    if request['code'] == nil
      auth_uri = auth_client.authorization_uri.to_s
      redirect_to auth_uri, allow_other_host: true
    else
      auth_client.code = request['code']
      auth_client.fetch_access_token!
      auth_client.client_secret = nil
      puts 'Auth Client================='
      puts auth_client.to_json
      puts 'Auth Client================='
      service = Google::Apis::GmailV1::GmailService.new
      service.authorization = auth_client.access_token
      user_id = "me"
      profile =  service.get_user_profile(user_id, fields: nil, quota_user: nil, options: nil)
      puts 'Profile ====================='
      puts profile
      puts 'Profile ====================='
      watch_request = Google::Apis::GmailV1::WatchRequest.new(
        topic_name: ENV['GOOGLE_TOPIC_NAME'],
        label_ids: ['UNREAD', "INBOX"],
        label_filter_behavior: 'INCLUDE'
      )
      watch_response = service.watch_user(user_id, watch_request_object = watch_request, fields: nil, quota_user: nil, options: nil)
      puts 'Watch response ====================='
      puts watch_response
      puts 'Watch response ====================='

      user = User.find_by(email: profile.email_address)
      if user
        user.update(auth_client: auth_client.to_json, access_token: auth_client.access_token, refresh_token: auth_client.refresh_token, provider: 'google' )
      else
        User.create(email: profile.email_address, auth_client: auth_client.to_json, access_token: auth_client.access_token, refresh_token: auth_client.refresh_token, provider: 'google' )
      end
      redirect_to root_url, notice: 'Succesfully Authenticated'
    end
  end

  def google_email_webhook
    NotifyOrderDetailsJob.set(wait: 10.minutes).perform_later(params.permit!)
  end

  def outlook_email_webhook
      OutlookNotifyOrderDetailsJob.set(wait: 5.minutes).perform_later(params.permit!)
      render plain: 'Ok'
  end
end
