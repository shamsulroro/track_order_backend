require 'net/http'
require 'uri'
require 'json'
class AfterShip


  def initialize(mail_response, user)
    @mail_response = mail_response
    @user = user
  end


  def parse_email_and_notify

    headers = @mail_response.payload.headers
    subject = headers.find {|header| header.name == "Subject" }

    html = @mail_response.payload.parts.last.body.data.encode(Encoding::UTF_32LE, "ISO-8859-1")

    headers = [
      {
          "name": "Delivered-To",
          "value": headers.find {|header| header.name == "Delivered-To" }&.value
      },
      {
          "name": "Received",
          "value": headers.find {|header| header.name == "Received" }&.value
      },
      {
          "name": "X-Received",
          "value": headers.find {|header| header.name == "X-Received" }&.value
      },
      {
          "name": "ARC-Seal",
          "value": headers.find {|header| header.name == "ARC-Seal" }&.value
      },
      {
          "name": "ARC-Message-Signature",
          "value": headers.find {|header| header.name == "ARC-Message-Signature" }&.value
      },
      {
          "name": "ARC-Authentication-Results",
          "value": headers.find {|header| header.name == "ARC-Authentication-Results" }&.value
      },
      {
          "name": "Return-Path",
          "value": headers.find {|header| header.name == "Return-Path" }&.value
      },
      {
          "name": "Received-SPF",
          "value": headers.find {|header| header.name == "Received-SPF" }&.value
      },
      {
          "name": "Authentication-Results",
          "value": headers.find {|header| header.name == "Authentication-Results" }&.value
      },
      {
          "name": "DKIM-Signature",
          "value": headers.find {|header| header.name == "DKIM-Signature" }&.value
      },
      {
          "name": "X-Google-DKIM-Signature",
          "value": headers.find {|header| header.name == "X-Google-DKIM-Signature" }&.value
      },
      {
          "name": "X-Gm-Message-State",
          "value": headers.find {|header| header.name == "X-Gm-Message-State" }&.value
      },
      {
          "name": "X-Google-Smtp-Source",
          "value": headers.find {|header| header.name == "X-Google-Smtp-Source" }&.value
      },
      {
          "name": "X-Received",
          "value": headers.find {|header| header.name == "X-Received" }&.value
      },
      {
          "name": "MIME-Version",
          "value": headers.find {|header| header.name == "MIME-Version" }&.value
      },
      {
          "name": "References",
          "value": headers.find {|header| header.name == "References" }&.value
      },
      {
          "name": "In-Reply-To",
          "value": headers.find {|header| header.name == "In-Reply-To" }&.value
      },
      {
          "name": "From",
          "value": headers.find {|header| header.name == "From" }&.value
      },
      {
          "name": "Date",
          "value": headers.find {|header| header.name == "Date" }&.value
      },
      {
          "name": "Message-ID",
          "value": headers.find {|header| header.name == "Message-ID" }&.value
      },
      {
          "name": "Subject",
          "value": headers.find {|header| header.name == "Subject" }&.value
      },
      {
          "name": "To",
          "value": headers.find {|header| header.name == "To" }&.value
      },
      {
          "name": "Cc",
          "value": headers.find {|header| header.name == "Cc" }&.value.to_s
      },
      {
          "name": "Content-Type",
          "value": headers.find {|header| header.name == "Content-Type" }&.value
      }
    ]

    request_body = {
      "labels" => @mail_response.label_ids,
      "body" => {
        "html" => html,
        "text" => Nokogiri::HTML(html).text,
      },
      "headers" => headers
    }

    begin
      @url = URI('https://api.aftership.com/admin/2022-01/email-parses-v2')
      http = Net::HTTP.new(@url.host, @url.port)
      http.use_ssl = true
      @request = Net::HTTP::Post.new(@url)
      @request["Content-Type"] = 'application/json'
      @request["As-Api-Key"] = ENV['AFTER_SHIP_API_KEY']
      @request.body = request_body.to_json
      response = http.request(@request)

      if response.code == "200"
        registration_ids = @user.devices.pluck(:token)
        parsed_response = JSON.parse(response.body)
        orders = parsed_response['data']['orders']
        orders.each do |order|
          options = { "notification": {
                "title": "Order Status of #{order['number']}",
                "body": "Current status is #{order['status']}"
            }
          }
          fcm_response = FCM_CLIENT.send(registration_ids, options)
          Rails.logger.info('Fcm client response---------------------')
          Rails.logger.info(orders)
          Rails.logger.info(fcm_response)
          Rails.logger.info('Fcm client response---------------------')
        end
      end
    rescue Exception => e
      Rails.logger.info(e)
    end
  end

  def parse_outlook_mail_and_notify
    subject = @mail_response["subject"]

    html = @mail_response['body']['content'].encode(Encoding::UTF_32LE, "ISO-8859-1")

    headers = [
      {
          "name": "Delivered-To",
          "value": @mail_response["toRecipients"].first['emailAddress']['address']
      },
      {
          "name": "From",
          "value": @mail_response['from']['emailAddress']['address']
      },
      {
          "name": "Date",
          "value": @mail_response['createdDateTime']
      },
      {
          "name": "Message-ID",
          "value": @mail_response['id']
      },
      {
          "name": "Subject",
          "value": @mail_response['subject']
      },
      {
          "name": "To",
          "value": @mail_response['toRecipients'].first['emailAddress']['address']
      },
      {
          "name": "Cc",
          "value": ''
      },
      {
          "name": "Content-Type",
          "value": @mail_response['body']['contentType']
      }
    ]

    request_body = {
      "body" => {
        "html" => html,
        "text" => Nokogiri::HTML(html).text,
      },
      "headers" => headers
    }

    begin
      @url = URI('https://api.aftership.com/admin/2022-01/email-parses-v2')
      http = Net::HTTP.new(@url.host, @url.port)
      http.use_ssl = true
      @request = Net::HTTP::Post.new(@url)
      @request["Content-Type"] = 'application/json'
      @request["As-Api-Key"] = ENV['AFTER_SHIP_API_KEY']
      @request.body = request_body.to_json
      response = http.request(@request)

      if response.code == "200"
        registration_ids = @user.devices.pluck(:token)
        parsed_response = JSON.parse(response.body)
        orders = parsed_response['data']['orders']
        orders.each do |order|
          options = { "notification": {
                "title": "Order Status of #{order['number']}",
                "body": "Current status is #{order['status']}"
            }
          }
          fcm_response = FCM_CLIENT.send(registration_ids, options)
          Rails.logger.info('Fcm client response---------------------')
          Rails.logger.info(orders)
          Rails.logger.info(fcm_response)
          Rails.logger.info('Fcm client response---------------------')
        end
      end
    rescue Exception => e
      Rails.logger.info(e)
    end
  end

  def self.fetch_emails(user)
    return unless user.google?

    service = Google::Apis::GmailV1::GmailService.new
    service.authorization = user.access_token
    user_id = "me"

    t1 = Time.now
    after_date = Time.now - 2.days
    next_page = nil
    error_counter = 0
    result_counter = 0
    error_ids = []
    messages_array = []

    begin
      result = service.list_user_messages(user_id,
        include_spam_trash: false, label_ids: nil, max_results: 100, page_token: next_page,
        q: "after:#{after_date.to_date}")
      ids = result&.messages&.map do |message|
        message.id
      end

      ids&.each do |id|
        service.get_user_message(user_id, id) do |res, err|
          if err
            error_ids << id
            error_counter += 1
          else
            messages_array << res
            result_counter += 1
          end
        end
      end

      next_page = result.next_page_token
    end while next_page

    messages_array.each do |message|
      new(message, user).parse_email_and_notify
    end
  end

  def self.fetch_outlook_emails_and_notify_order_status(user)
    return unless user.outlook?

    unless user.token_expiry > (Time.current - 10.minutes)
      user.update_outlook_access_tokens
      user.reload
    end

    responses = HTTParty.get("https://graph.microsoft.com/v1.0/me/messages", :headers => {
      "Scope" => "Mail.Read",
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{user.access_token}"
    })
    return unless responses.response.code == '200'

    responses['value'].each do |mail_response|
      AfterShip.new(mail_response, user).parse_outlook_mail_and_notify
    end
  end
end
