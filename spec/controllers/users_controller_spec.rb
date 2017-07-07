require 'rails_helper'

describe UsersController do
  describe '#create' do
    before do
      @user = Fabricate.build(:user)
      @user.password = "strongpassword"
    end

    let(:post_user_params) do
      { password: "strongpassword", email: @user.email }
    end

    def post_user
      post :create, xhr: true, params: post_user_params
    end

    context 'when email params is missing' do
      it 'should raise the right error' do
        expect do
          post :create, xhr: true, params: { passsword: 'tesing12352343' }
        end.to raise_error(ActionController::ParameterMissing)
      end
    end

    context 'when creating a non active user (unconfirmed email)' do
      it 'creates a user correctly' do
        post_user
        
        expect_job_type("UserMailer", "signup")
        expect(JSON.parse(response.body)['active']).to be_falsey
      end
    end

    context 'after success' do
      before { post_user }

      it 'should succeed' do
        is_expected.to respond_with(:success)
      end

      it 'has the proper JSON' do
        json = JSON::parse(response.body)
        expect(json["success"]).to eq(true)
      end

      it 'should not result in an active account' do
        expect(User.find_by(email: @user.email).active).to eq(false)
      end
    end

    context 'when password param is missing' do
      it 'should raise the right error' do
        expect do
          post :create, xhr: true, params: { passsword: '' }
        end.to raise_error(ActionController::ParameterMissing)
      end
    end

    context 'when password is too long' do
      let(:create_params) { {password: "x" * (User.max_password_length + 1), email: @user.email} }
      
      it 'should not create a new User' do
        expect { post :create, xhr: true, params: create_params }.to_not change { User.count }
      end

      it 'should report failed' do
        post :create, xhr: true, params: create_params
        json = JSON::parse(response.body)
        expect(json["success"]).not_to eq(true)
      end
    end

    context "when taking over a shadow account" do
      let!(:shadow) { Fabricate(:shadow) }
      let!(:email) { "shadowman@gmail.com" }

      it "succeeds" do
        log_in_user(shadow)
        post :create, xhr: true, params: { email: email, password: "P4ssw0rd$$" }
        result = ::JSON.parse(response.body)
        expect(result["success"]).to eq(true)
        resulting_user = User.find_by(email: email)
        expect(resulting_user.id).to eq(shadow.id)
        expect(resulting_user.shadow).to eq(false)
      end
    end
  end

  describe '#activate' do
    context 'invalid token' do
      render_views

      it 'return success' do        
        EmailToken.expects(:confirm).with('asdfasdf').returns(nil)
        get :activate, params: { token: 'asdfasdf' }
        expect(response).to be_success
        expect(response.body).to match(I18n.t('activation.already_done'))
      end
    end

    context 'valid token' do
      let(:user) { Fabricate(:user) }

      context 'response' do
        it 'correctly logs on user' do
          EmailToken.expects(:confirm).with('asdfasdf').returns(user)

          get :activate, params: { token: 'asdfasdf' }

          expect(response).to be_success
          expect(flash[:error]).to be_blank
          expect(session[:current_user_id]).to be_present
        end
      end
    end
  end

  describe '#password_reset' do
    let(:user) { Fabricate(:user) }

    def get_token(token)
      get :password_reset, params: { token: token }
    end

    def put_token(token, password=nil)
      put :password_reset, params: { token: token, password: password }
    end
    
    context 'invalid token' do
      before do
        get_token "evil_trout!"
      end

      it 'disallows login' do
        expect(assigns[:error]).to be_present
        expect(session[:current_user_id]).to be_blank
        expect(response).to be_success
      end
    end

    context 'valid token' do
      # context 'when rendered' do
      #   render_views

      #   it 'renders referrer never on get requests' do
      #     user = Fabricate(:user)
      #     token = user.email_tokens.create(email: user.email).token
      #     get_token token

      #     expect(response.body).to include('<meta name="referrer" content="never">')
      #   end
      # end

      it 'returns success' do
        user = Fabricate(:user)
        user_auth_token = UserAuthToken.generate!(user_id: user.id)
        token = user.email_tokens.create(email: user.email).token
        get_token token

        put_token token, 'hg9ow8yhg98o'

        expect(response).to be_success
        expect(assigns[:error]).to be_blank

        user.reload

        expect(session["password-#{token}"]).to be_blank
        expect(UserAuthToken.where(id: user_auth_token.id).count).to eq(0)
      end

      it 'disallows double password reset' do
        user = Fabricate(:user)
        token = user.email_tokens.create(email: user.email).token

        get_token token
        put_token token, 'hg9ow8yHG32O'
        put_token token, 'test123987AsdfXYZ'

        user.reload
        expect(user.confirm_password?('hg9ow8yHG32O')).to eq(true)

        # logged in now
        expect(user.user_auth_tokens.count).to eq(1)
      end

      it "doesn't invalidate the token when loading the page" do
        user = Fabricate(:user)
        user_token = UserAuthToken.generate!(user_id: user.id)

        email_token = user.email_tokens.create(email: user.email)

        get_token email_token.token

        email_token.reload

        expect(email_token.confirmed).to eq(false)
        expect(UserAuthToken.where(id: user_token.id).count).to eq(1)
      end
    end

    context 'submit change' do
      let(:token) { EmailToken.generate_token }

      it "fails when the password is blank" do
        EmailToken.expects(:confirm).with(token).returns(user)
        put_token token, ''
        expect(assigns(:user).errors).to be_present
        expect(session[:current_user_id]).to be_blank
      end

      it "fails when the password is too long" do
        EmailToken.expects(:confirm).with(token).returns(user)
        put_token token, ('x' * (User.max_password_length + 1))
        expect(assigns(:user).errors).to be_present
        expect(session[:current_user_id]).to be_blank
      end

      it "logs in the user" do
        EmailToken.expects(:confirm).with(token).returns(user)
        put_token token, 'ksjafh928r'
        expect(assigns(:user).errors).to be_blank
        expect(session[:current_user_id]).to be_present
      end
    end
  end
end
