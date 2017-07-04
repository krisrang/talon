require 'rails_helper'
require_dependency 'user'

describe User do
  context 'validations' do
    describe 'emails' do
      let(:user) { Fabricate.build(:user) }

      it { is_expected.to validate_presence_of :email }

      describe 'when record has a valid email' do
        it "should be valid" do
          user.email = 'test@gmail.com'
          expect(user).to be_valid
        end
      end

      describe 'when record has an invalid email' do
        it 'should not be valid' do
          user.email = 'test@gmailcom'
          expect(user).to_not be_valid
        end
      end

      describe 'when shadow record has no email' do
        it 'should be valid' do
          user.shadow = true
          user.email = nil
          expect(user).to be_valid
        end
      end
    end
  end

  describe 'new' do
    subject { Fabricate.build(:user) }

    it { is_expected.to be_valid }
    it { is_expected.not_to be_admin }

    context 'after_save' do
      before { subject.save! }

      it "has correct settings" do
        expect(subject.email_tokens).to be_present
      end
    end

    it "downcases email addresses" do
      user = Fabricate.build(:user, email: 'Fancy.Caps.4.U@gmail.com')
      user.valid?
      expect(user.email).to eq('fancy.caps.4.u@gmail.com')
    end

    it "strips whitespace from email addresses" do
      user = Fabricate.build(:user, email: ' example@gmail.com ')
      user.valid?
      expect(user.email).to eq('example@gmail.com')
    end
  end

  describe 'email_hash' do
    before do
      @user = Fabricate(:user)
    end

    it 'should have a sane email hash' do
      expect(@user.email_hash).to match(/^[0-9a-f]{32}$/)
    end

    it 'should use downcase email' do
      @user.email = "example@example.com"
      @user2 = Fabricate(:user)
      @user2.email = "ExAmPlE@eXaMpLe.com"

      expect(@user.email_hash).to eq(@user2.email_hash)
    end

    it 'should trim whitespace before hashing' do
      @user.email = "example@example.com"
      @user2 = Fabricate(:user)
      @user2.email = " example@example.com "

      expect(@user.email_hash).to eq(@user2.email_hash)
    end
  end

  describe 'passwords' do
    it "should not have an active account with a good password" do
      @user = Fabricate.build(:user, active: false)
      @user.password = "ilovepasta"
      @user.save!

      expect(@user.active).to eq(false)
      expect(@user.confirm_password?("ilovepasta")).to eq(true)

      email_token = @user.email_tokens.create(email: 'pasta@delicious.com')

      UserAuthToken.generate!(user_id: @user.id)

      @user.password = "passwordT"
      @user.save!

      # must expire old token on password change
      expect(@user.user_auth_tokens.count).to eq(0)

      email_token.reload
      expect(email_token.expired).to eq(true)
    end
  end

  describe "update_last_seen!" do
    let (:user) { Fabricate(:user) }
    let!(:first_visit_date) { Time.zone.now }
    let!(:second_visit_date) { 2.hours.from_now }

    it "should update the last seen value" do
      expect(user.last_seen_at).to eq nil
      user.update_last_seen!(first_visit_date)
      expect(user.reload.last_seen_at).to be_within_one_second_of(first_visit_date)
    end
  end

  describe "last_seen_at" do
    let(:user) { Fabricate(:user) }

    it "should have a blank last seen on creation" do
      expect(user.last_seen_at).to eq(nil)
    end

    describe 'with no previous values' do
      let!(:date) { Time.zone.now }

      before do
        Timecop.freeze(date)
        user.update_last_seen!
      end

      after do
        Timecop.return
      end

      it "updates last_seen_at" do
        expect(user.last_seen_at).to be_within_one_second_of(date)
      end
    end
  end

  describe 'email_confirmed?' do
    let(:user) { Fabricate(:user) }

    context 'when email has not been confirmed yet' do
      it 'should return false' do
        expect(user.email_confirmed?).to eq(false)
      end
    end

    context 'when email has been confirmed' do
      it 'should return true' do
        token = user.email_tokens.find_by(email: user.email)
        EmailToken.confirm(token.token)
        expect(user.email_confirmed?).to eq(true)
      end
    end

    context 'when user has no email tokens for some reason' do
      it 'should return false' do
        user.email_tokens.each {|t| t.destroy}
        user.reload
        expect(user.email_confirmed?).to eq(true)
      end
    end
  end

  describe 'api keys' do
    let(:user) { Fabricate(:user) }

    describe '.generate_api_key' do
      it "generates an api key when none exists, and regenerates when it does" do
        expect(user.api_key).to be_blank

        # Generate a key
        api_key = user.generate_api_key
        expect(user.api_key).to be_present

        user.reload
        expect(user.api_key).to eq(api_key)

        # Regenerate a key. Keeps the same record, updates the key
        user.generate_api_key
        expect(user.api_key).to_not eq(api_key)
      end
    end

    describe '.revoke_api_key' do
      it "revokes an api key when exists" do
        expect(user.api_key).to be_blank

        # Revoke nothing does nothing
        user.revoke_api_key
        user.reload
        expect(user.api_key).to be_blank

        # When a key is present it is removed
        user.generate_api_key
        user.reload
        user.revoke_api_key
        user.reload
        expect(user.api_key).to be_blank
      end
    end
  end

  describe "hash_passwords" do
    let(:too_long) { "x" * (User.max_password_length + 1) }

    def hash(password, salt)
      User.new.send(:hash_password, password, salt)
    end

    it "returns the same hash for the same password and salt" do
      expect(hash('poutine', 'gravy')).to eq(hash('poutine', 'gravy'))
    end

    it "returns a different hash for the same salt and different password" do
      expect(hash('poutine', 'gravy')).not_to eq(hash('fries', 'gravy'))
    end

    it "returns a different hash for the same password and different salt" do
      expect(hash('poutine', 'gravy')).not_to eq(hash('poutine', 'cheese'))
    end

    it "raises an error when passwords are too long" do
      expect { hash(too_long, 'gravy') }.to raise_error(StandardError)
    end
  end
end
