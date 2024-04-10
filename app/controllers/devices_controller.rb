class DevicesController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    if params[:email].present? && params[:device_token].present?
      user = User.find_by(email: params[:email])

      if user
        device = user.devices.find_by(token: params[:device_token])
        user.devices.create(token: params[:device_token], platform: params[:platform]) unless device
      else
        user = User.create(email: params[:email])
        user.devices.create(token: params[:device_token], platform: params[:platform])
      end
      render json: {}, status: :ok
    else
      render json: { error: "Device token and email cannot be blank" }, status: 422
    end
  end
end
