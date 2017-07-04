class Settings
  def self.setting(name, default)
    self.class.send(:attr_accessor, name)
    self.send("#{name}=", default)
  end
  
  setting :force_https,                   Rails.env.production?
  setting :same_site_cookies,             "Lax"
  setting :developer_emails,              ENV.fetch("DEVELOPER_EMAILS", "").split(",")
  setting :active_user_rate_limit_secs,   60
  setting :min_password_length,           6
  setting :email_token_valid_hours,       48
  setting :maximum_session_age,           1440
  setting :max_user_api_reqs_per_day,     2880
  setting :max_user_api_reqs_per_minute,  20
end
