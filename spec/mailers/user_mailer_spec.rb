require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  describe "signup" do
    let(:token) { Fabricate(:user, active: false).email_tokens.unconfirmed.active.first }
    let(:mail) { UserMailer.signup(token.user_id, token.token) }

    it "renders the headers" do
      expect(mail.subject).to eq(I18n.t('mailers.user.signup.subject'))
      expect(mail.to).to eq([token.email])
      expect(mail.from).to eq([ENV["ACTION_MAILER_DEFAULT_FROM"]])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match(activate_user_url(token: token.token))
    end
  end

  describe "forgot_password" do
    let(:token) { Fabricate(:user).email_tokens.unconfirmed.active.first }
    let(:mail) { UserMailer.forgot_password(token.user_id, token.token) }

    it "renders the headers" do
      expect(mail.subject).to eq(I18n.t('mailers.user.forgot_password.subject'))
      expect(mail.to).to eq([token.email])
      expect(mail.from).to eq([ENV["ACTION_MAILER_DEFAULT_FROM"]])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match(password_reset_user_url(token: token.token))
    end
  end
end
