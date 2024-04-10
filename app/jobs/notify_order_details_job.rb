require "google/apis/gmail_v1"
require 'google/api_client/client_secrets'
class NotifyOrderDetailsJob < ApplicationJob
  queue_as :default

  def perform(params)
    data =  Base64.decode64(params[:message][:data])
    email = JSON.parse(data)['emailAddress']
    user = User.find_by(email: email)
    return unless user
    # client_opts = JSON.parse(user.auth_client)
    # auth_client = Signet::OAuth2::Client.new(client_opts)
    service = Google::Apis::GmailV1::GmailService.new
    service.authorization = user.access_token
    user_id = "me"
    @user_history = nil
    service.list_user_histories(user_id, history_types: nil, label_id: nil, max_results: nil, page_token: nil, start_history_id: JSON.parse(data)['historyId'], fields: nil, quota_user: nil, options: nil)  do |res, err|
      if err
        Rails.logger.info('User History callback error---------------------')
        Rails.logger.info("Error: #{err}")
        Rails.logger.info('User History callback error---------------------')

        user.update_access_token if "#{err}" == 'Unauthorized'
        NotifyOrderDetailsJob.set(wait: 5.minutes).perform_later(params)
        return
      else
        Rails.logger.info('User History callback---------------------')
        Rails.logger.info("Response: #{res}")
        Rails.logger.info('User History callback---------------------')
        @user_history = res
      end
    end

    message_id = @user_history&.history&.last&.messages&.last&.id
    if message_id.blank?
      NotifyOrderDetailsJob.set(wait: 10.minutes).perform_later(params)
      return
    end

    service.get_user_message(user_id, message_id) do |res, err|
      if err
        Rails.logger.info('User Message callback error---------------------')
        Rails.logger.info("Error: #{err}")
        Rails.logger.info('User Message callback error---------------------')
        NotifyOrderDetailsJob.set(wait: 10.minutes).perform_later(params)
      else
        Rails.logger.info('User Message callback---------------------')
        Rails.logger.info("Response: #{res}")
        Rails.logger.info('User Message callback---------------------')
        AfterShip.new(res, user).parse_email_and_notify
      end
    end
  end
end
