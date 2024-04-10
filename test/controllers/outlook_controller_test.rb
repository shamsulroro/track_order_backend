require "test_helper"

class OutlookControllerTest < ActionDispatch::IntegrationTest
  test "should get auth" do
    get outlook_auth_url
    assert_response :success
  end
end
