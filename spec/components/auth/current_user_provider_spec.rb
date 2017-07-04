require 'rails_helper'
require_dependency 'auth/current_user_provider'

describe Auth::CurrentUserProvider do
  class TestProvider < Auth::CurrentUserProvider
    attr_reader :env
    def initialize(env)
      super(env)
    end
  end

  def provider(url, opts=nil)
    opts ||= {method: "GET"}
    env = Rack::MockRequest.env_for(url, opts)
    TestProvider.new(env)
  end

  it "should update last seen for non ajax" do
    expect(provider("/topic/anything/goes", method: "POST").should_update_last_seen?).to eq(true)
    expect(provider("/topic/anything/goes", method: "GET").should_update_last_seen?).to eq(true)
  end

  it "correctly rotates tokens" do
    Settings.maximum_session_age = 3
    user = Fabricate(:user)
    @provider = provider('/')
    cookies = {}
    @provider.log_on_user(user, {}, cookies)

    unhashed_token = cookies["_t"][:value]

    token = UserAuthToken.find_by(user_id: user.id)

    expect(token.auth_token_seen).to eq(false)
    expect(token.auth_token).not_to eq(unhashed_token)
    expect(token.auth_token).to eq(UserAuthToken.hash_token(unhashed_token))

    # at this point we are going to try to rotate token
    freeze_time 20.minutes.from_now

    provider2 = provider("/", "HTTP_COOKIE" => "_t=#{unhashed_token}")
    provider2.current_user

    token.reload
    expect(token.auth_token_seen).to eq(true)

    cookies = {}
    provider2.refresh_session(user, {}, cookies)
    expect(cookies["_t"][:value]).not_to eq(unhashed_token)

    token.reload
    expect(token.auth_token_seen).to eq(false)

    freeze_time 21.minutes.from_now

    old_token = token.prev_auth_token
    unverified_token = token.auth_token

    # old token should still work
    provider2 = provider("/", "HTTP_COOKIE" => "_t=#{unhashed_token}")
    expect(provider2.current_user.id).to eq(user.id)

    provider2.refresh_session(user, {}, cookies)

    token.reload

    # because this should cause a rotation since we can safely
    # assume it never reached the client
    expect(token.prev_auth_token).to eq(old_token)
    expect(token.auth_token).not_to eq(unverified_token)

  end

  it "can only try 10 bad cookies a minute" do
    user = Fabricate(:user)
    token = UserAuthToken.generate!(user_id: user.id)

    provider('/').log_on_user(user, {}, {})

    RateLimiter.stubs(:disabled?).returns(false)

    RateLimiter.new(nil, "cookie_auth_10.0.0.1", 10, 60).clear!
    RateLimiter.new(nil, "cookie_auth_10.0.0.2", 10, 60).clear!

    ip = "10.0.0.1"
    env = { "HTTP_COOKIE" => "_t=#{SecureRandom.hex}", "REMOTE_ADDR" => ip }

    10.times do
      provider('/', env).current_user
    end

    expect {
      provider('/', env).current_user
    }.to raise_error(Talon::InvalidAccess)

    expect {
      env["HTTP_COOKIE"] = "_t=#{token.unhashed_auth_token}"
      provider("/", env).current_user
    }.to raise_error(Talon::InvalidAccess)

    env["REMOTE_ADDR"] = "10.0.0.2"

    expect {
      provider('/', env).current_user
    }.not_to raise_error
  end

  it "correctly removes invalid cookies" do
    cookies = {"_t" => SecureRandom.hex}
    provider('/').refresh_session(nil, {}, cookies)
    expect(cookies.key?("_t")).to eq(false)
  end

  it "logging on user always creates a new token" do
    user = Fabricate(:user)

    provider('/').log_on_user(user, {}, {})
    provider('/').log_on_user(user, {}, {})

    expect(UserAuthToken.where(user_id: user.id).count).to eq(2)
  end

  it "sets secure, same site lax cookies" do
    Settings.force_https = false
    Settings.same_site_cookies = "Lax"

    user = Fabricate(:user)
    cookies = {}
    provider('/').log_on_user(user, {}, cookies)


    expect(cookies["_t"][:same_site]).to eq("Lax")
    expect(cookies["_t"][:httponly]).to eq(true)
    expect(cookies["_t"][:secure]).to eq(false)

    Settings.force_https = true
    Settings.same_site_cookies = "Disabled"

    cookies = {}
    provider('/').log_on_user(user, {}, cookies)

    expect(cookies["_t"][:secure]).to eq(true)
    expect(cookies["_t"].key?(:same_site)).to eq(false)
  end

  it "correctly expires session" do
    Settings.maximum_session_age = 2
    user = Fabricate(:user)
    token = UserAuthToken.generate!(user_id: user.id)

    provider('/').log_on_user(user, {}, {})

    expect(provider("/", "HTTP_COOKIE" => "_t=#{token.unhashed_auth_token}").current_user.id).to eq(user.id)

    freeze_time 3.hours.from_now
    expect(provider("/", "HTTP_COOKIE" => "_t=#{token.unhashed_auth_token}").current_user).to eq(nil)
  end

  context "api" do
    let :user do
      u = Fabricate(:user)
      u.generate_api_key
      u
    end

    it "raises errors for incorrect api_key" do
      expect{
        provider("/?api_key=INCORRECT").current_user
      }.to raise_error(Talon::InvalidAccess)
    end

    it "finds a user for a correct api key" do
      expect(provider("/?api_key=#{user.api_key}").current_user.id).to eq(user.id)

      user.update_columns(active: false)

      expect{
        provider("/?api_key=#{user.api_key}").current_user
      }.to raise_error(Talon::InvalidAccess)

      user.update_columns(active: true, suspended: true)

      expect{
        provider("/?api_key=#{user.api_key}").current_user
      }.to raise_error(Talon::InvalidAccess)
    end

    it "allows API access correctly via header" do
      params = {
        "REQUEST_METHOD" => "GET",
        "HTTP_API_KEY" => user.api_key,
      }

      good_provider = provider("/", params)

      expect(good_provider.current_user.id).to eq(user.id)
      expect(good_provider.is_api?).to eq(true)

      user.update_columns(suspended: true)

      expect {
        provider("/", params).current_user
      }.to raise_error(Talon::InvalidAccess)
    end
  end
end
