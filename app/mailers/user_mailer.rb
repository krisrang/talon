class UserMailer < ApplicationMailer
  def signup(id, token)
    @user = User.find(id)
    @title = I18n.t('mailers.user.signup.title')
    @body = I18n.t('mailers.user.signup.template', link: activate_user_url(token: token))

    mail(to: @user.email, subject: I18n.t('mailers.user.signup.subject')) do |format|
      format.text { render plain: @body }
    end
  end

  def forgot_password(id, token)
    @user = User.find(id)
    @title = I18n.t('mailers.user.forgot_password.title')
    @body = I18n.t('mailers.user.forgot_password.template', base_url: Talon.base_url, link: password_reset_user_url(token: token))

    mail(to: @user.email, subject: I18n.t('mailers.user.forgot_password.subject')) do |format|
      format.text { render plain: @body }
    end
  end
end
