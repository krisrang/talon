require 'rails_helper'

describe SessionsController do
  describe '.create' do
    let(:user) { Fabricate(:user) }

    context 'when email is confirmed' do
      before do
        token = user.email_tokens.find_by(email: user.email)
        EmailToken.confirm(token.token)
      end

      it "raises an error when the login isn't present" do
        expect { xhr :post, :create }.to raise_error(ActionController::ParameterMissing)
      end

      describe 'invalid password' do
        it "should return an error with an invalid password" do
          xhr :post, :create, email: user.email, password: 'sssss'
          expect(::JSON.parse(response.body)['error']).to be_present
        end
      end

      describe 'invalid password' do
        it "should return an error with an invalid password if too long" do
          xhr :post, :create, email: user.email, password: ('s' * (User.max_password_length + 1))
          expect(::JSON.parse(response.body)['error']).to be_present
        end
      end

      describe 'suspended user' do
        it 'should return an error' do
          user.suspended = true
          user.save!
          xhr :post, :create, email: user.email, password: 'myawesomepassword'

          error = ::JSON.parse(response.body)['error']
          expect(error).to be_present
          expect(error).to match(/suspended/)
        end
      end

      describe 'deactivated user' do
        it 'should return an error' do
          user.active = false
          user.save
          xhr :post, :create, email: user.email, password: 'myawesomepassword'
          expect(JSON.parse(response.body)['error']).to eq(I18n.t('login.not_activated'))
        end
      end

      describe 'success by username' do
        it 'logs in correctly' do
          xhr :post, :create, email: user.email, password: 'myawesomepassword'
          user.reload

          expect(session[:current_user_id]).to eq(user.id)
          expect(user.user_auth_tokens.count).to eq(1)
          expect(UserAuthToken.hash_token(cookies[:_t])).to eq(user.user_auth_tokens.first.auth_token)
        end
      end

      context 'email has leading and trailing space' do
        let(:email) { " #{user.email} " }

        it "strips spaces from the email" do
          xhr :post, :create, email: email, password: 'myawesomepassword'
          expect(::JSON.parse(response.body)['error']).not_to be_present
        end
      end
    end

    context 'when email has not been confirmed' do
      def post_login
        xhr :post, :create, email: user.email, password: 'myawesomepassword'
      end

      it "doesn't log in the user" do
        post_login
        expect(session[:current_user_id]).to be_blank
      end

      it "shows the 'not activated' error message" do
        post_login
        expect(JSON.parse(response.body)['error']).to eq(
          I18n.t 'login.not_activated'
        )
      end
    end

    context 'rate limited' do
      before do
        token = user.email_tokens.find_by(email: user.email)
        EmailToken.confirm(token.token)
      end
      
      it 'rate limits login' do
        Settings.max_logins_per_ip_per_hour = 2
        RateLimiter.stubs(:disabled?).returns(false)
        RateLimiter.clear_all!

        2.times do
          xhr :post, :create, email: user.email, password: 'myawesomepassword'
          expect(response).to be_success
        end
        xhr :post, :create, email: user.email, password: 'myawesomepassword'
        expect(response).not_to be_success
        json = JSON.parse(response.body)
        expect(json["error_type"]).to eq("rate_limit")
      end
    end
  end

  describe '.destroy' do
    before do
      @user = log_in
      xhr :delete, :destroy
    end

    it 'removes the session variable' do
      expect(session[:current_user_id]).to be_blank
    end

    # it 'removes the auth token cookie' do
    #   expect(cookies["_t"]).to be_blank
    # end
  end

  describe '.forgot_password' do
    it 'raises an error without a username parameter' do
      expect { xhr :post, :forgot_password }.to raise_error(ActionController::ParameterMissing)
    end

    context 'for a non existant email' do
      it "doesn't generate a new token for a made up username" do
        expect { xhr :post, :forgot_password, email: 'made_up@email.com'}.not_to change(EmailToken, :count)
      end

      it "doesn't enqueue an email" do
        xhr :post, :forgot_password, email: 'made_up@email.com'
        expect_no_jobs
      end
    end

    context 'for an existing email' do
      let(:user) { Fabricate(:user) }

      it "enqueues an email" do
        xhr :post, :forgot_password, email: user.email
        expect_job_type("UserMailer", "forgot_password")
      end
    end
  end
end
