require_dependency 'rate_limiter'

class SessionsController < ApplicationController
  def new
    render 'shared/client'
  end
  
  def create
    RateLimiter.new(nil, "login-hr-#{request.remote_ip}", Settings.max_logins_per_ip_per_hour, 1.hour).performed!
    RateLimiter.new(nil, "login-min-#{request.remote_ip}", Settings.max_logins_per_ip_per_minute, 1.minute).performed!

    params.require(:email)
    params.require(:password)

    return invalid_credentials if params[:password].length > User.max_password_length

    email = params[:email].strip.downcase

    if user = User.find_by(email: email)
      # If their password is correct
      unless user.confirm_password?(params[:password])
        invalid_credentials
        return
      end
    else
      invalid_credentials
      return
    end

    if user.suspended?
      failed_to_login(user)
      return
    end

    if user.active && user.email_confirmed?
      # TODO: deal with shadow user
      login(user)
    else
      not_activated(user)
    end
  end

  def forgot_password
    params.require(:email)

    RateLimiter.new(nil, "forgot-password-hr-#{request.remote_ip}", 6, 1.hour).performed!
    RateLimiter.new(nil, "forgot-password-min-#{request.remote_ip}", 3, 1.minute).performed!

    RateLimiter.new(nil, "forgot-password-login-hour-#{params[:email].to_s[0..100]}", 12, 1.hour).performed!
    RateLimiter.new(nil, "forgot-password-login-min-#{params[:email].to_s[0..100]}", 3, 1.minute).performed!

    user = User.find_by(email: params[:email])
    if user.present? && user.id > 0 && !user.shadow
      email_token = user.email_tokens.create(email: user.email)
      UserMailer.forgot_password(user.id, email_token.token).deliver_later
    end

    render json: { ok: true, message: I18n.t('forgot_password.complete', email: params[:email]) }
  end

  def destroy
    reset_session
    log_off_user

    if request.xhr?
      render json: {ok: true}
    else
      redirect_to (params[:return_url] || root_path)
    end
  end

  private

  def invalid_credentials
    render json: {error: I18n.t("login.incorrect_email_or_password")}, status: 401
  end

  def not_activated(user)
    render json: {
      error: I18n.t("login.not_activated"),
      reason: 'not_activated',
      email: user.email
    }, status: 401
  end

  def failed_to_login(user)
    render json: {
      error: I18n.t("login.suspended"),
      reason: 'suspended'
    }, status: 401
  end

  def login(user)
    log_on_user(user)
    render json: { user: serialize(user), downloads: serialize(user.downloads) }
  end
end
