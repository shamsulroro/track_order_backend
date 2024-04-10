class OutlookNotifyOrderDetailsJob < ApplicationJob
  queue_as :default

  def perform(params)
    webhook_data = params['value'].first
    resource = webhook_data['resource'].split('/')
    user = User.find_by(outlook_userid: resource[1])
    return unless user

    unless user.token_expiry <= (Time.current + 10.minutes)
      user.update_outlook_access_tokens
      user.reload
    end

    access_token = user.access_token
    response = HTTParty.get("https://graph.microsoft.com/v1.0/me/messages/#{params['value'].first['resourceData']['id']}", :headers => {
      "Scope" => " Mail.Read",
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{access_token}"
    })
    AfterShip.new(response, user).parse_outlook_mail_and_notify
  end
end
