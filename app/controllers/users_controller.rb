class UsersController < ApplicationController
  def new
    render 'shared/client'
  end
  
  def create
    return already_logged_in if current_user && !current_user.shadow

    params.require(:email)
    params.require(:password)

    if params[:password] && params[:password].length > User.max_password_length
      return fail_with(:password, "login.password_too_long")
    end

    if params[:email].length > 254 + 1 + 253
      return fail_with(:email, "login.email_too_long")
    end

    # actualize shadow user
    if current_user && current_user.shadow
      user = current_user
      user_params.each { |k, v| user.send("#{k}=", v) }
      user.shadow = false
      user.create_email_token
    else
      user = User.new(user_params)
    end

    if user.save
      email_token = user.email_tokens.unconfirmed.active.first
      email_token = user.email_tokens.create(email: user.email) if email_token.nil?

      UserMailer.signup(user.id, email_token.token).deliver_later
      message = I18n.t("login.activate_email", email: Rack::Utils.escape_html(user.email))

      render json: {
        success: true,
        active: user.active?,
        message: message,
        user_id: user.id
      }
    else
      render json: { errors: flat_errors(user) }, status: 422
    end
  end

  def activate
    if @user = EmailToken.confirm(params[:token])
      log_on_user(@user)
      @preload = { register_result: I18n.t('activation.please_continue') }
    else
      @preload = { register_result: I18n.t('activation.already_done') }
    end

    render 'shared/client'
  end

  def password_reset
    token = params[:token]

    if EmailToken.valid_token_format?(token)
      @user = request.put? ? EmailToken.confirm(token) : EmailToken.confirmable(token)&.user

      if @user
        secure_session["password-#{token}"] = @user.id
      else
        user_id = secure_session["password-#{token}"].to_i
        @user = User.find(user_id) if user_id > 0
      end
    end

    if !@user
      @error = I18n.t('password_reset.no_token')
    elsif request.put?
      @invalid_password = params[:password].blank? || params[:password].length > User.max_password_length

      if @invalid_password
        @user.errors.add(:password, :invalid)
      else
        @user.password = params[:password]
        @user.user_auth_tokens.destroy_all
        if @user.save
          secure_session["password-#{token}"] = nil
          log_on_user(@user)
          @success = I18n.t('password_reset.success')
        end
      end
    end

    respond_to do |format|
      format.html do
        @preload = { password_reset_result: @error } if @error
        render 'shared/client'
      end

      format.json do
        if request.put?
          if @error || @user&.errors&.any?
            render json: {
              success: false,
              message: @error,
              errors: flat_errors(@user)
            }, status: 422
          else
            render json: {
              success: true,
              message: @success,
              user: serialize(current_user)
            }
          end
        end
      end
    end
  end

  private

  def fail_with(field, key)
    result = { success: false, errors: {} }
    result[:errors][field] = I18n.t(key)
    render json: result, status: 422
  end

  def user_params
    params.permit(:email, :password).merge(ip_address: request.remote_ip)
  end
end
