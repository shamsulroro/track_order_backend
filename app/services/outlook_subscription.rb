require 'httparty'

class OutlookSubscription
  SUBSCRIPTION_URL = 'https://graph.microsoft.com/v1.0/subscriptions'

  def initialize(user, token=nil)
    @user = user
    @subscription = user.subscription
    @access_token = token || user.access_token
  end


  def create
    begin
      create_subscription
    rescue => e
      Rails.logger.error(e)
    end
  end

  def update
    begin
      subscription_payload = {
        expirationDateTime: (Time.now + 10070.minutes).utc.iso8601(7)
      }
      response = HTTParty.patch("#{SUBSCRIPTION_URL}/#{@subscription.outlookid}",
                               body: subscription_payload.to_json,
                               headers: {
                                 'Authorization' => "Bearer #{@access_token}",
                                 'Content-Type' => 'application/json'
                               })

      @subscription.update(expiry: response["expirationDateTime"].to_time, response: response) if response.response.code == '200'
    rescue => e
      Rails.logger.error(e)
    end
  end

  def delete
    begin
      response = HTTParty.delete("#{SUBSCRIPTION_URL}/#{@subscription.outlookid}",
                                 headers: {
                                   'Authorization' => "Bearer #{@access_token}",
                                   'Content-Type' => 'application/json'
                                 })

      @subscription.destroy if response.code == 200
    rescue => e
      Rails.logger.error(e)
    end
  end

  private

  # def get_token
  #   url = "https://login.microsoftonline.com/#{ENV.fetch('AZURE_TENANT_ID')}/oauth2/v2.0/token"
  #   params = {
  #     body: {
  #       client_id: ENV.fetch('AZURE_APP_ID'),
  #       client_secret: ENV.fetch('AZURE_APP_SECRET'),
  #       scope: 'https://graph.microsoft.com/.default',
  #       grant_type: 'client_credentials'
  #     }
  #   }

  #   response = HTTParty.post(url, params)

  #   data = JSON.parse(response.body)
  #   data['access_token']
  # end

  def create_subscription
    return if @subscription && @subscription&.expiry > Time.current

    subscription_payload = {
      changeType: "created",
      notificationUrl: "https://test-shamsul.ngrok.app/outlook_email_webhook",
      resource: "/me/mailfolders('inbox')/messages",
      expirationDateTime: (Time.now + 10070.minutes).utc.iso8601(7),
    }

    response = HTTParty.post(SUBSCRIPTION_URL,
                             body: subscription_payload.to_json,
                             headers: {
                               'Authorization' => "Bearer #{@access_token}",
                               'Content-Type' => 'application/json'
                             })
    Subscription.create(user: user, outlookid:  response["id"],
      expiry: response["expirationDateTime"].to_time, response: response)  if ['200', '201'].include?(response.response.code)
  end
end
