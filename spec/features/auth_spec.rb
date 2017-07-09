require 'rails_helper'

RSpec.feature "Authentication", type: :feature, js: true do
  scenario "shows forms" do
    visit "/"
    click_button "Login"
    expect_to_see_auth_form(:login)

    click_on "Register"
    expect_to_see_auth_form(:register)

    click_on "Login"
    expect_to_see_auth_form(:login)

    visit login_path
    expect_to_see_auth_form(:login)

    visit register_path
    expect_to_see_auth_form(:register)
  end

  # wip
  context "login" do
    scenario "validates" do
      visit login_path
      expect_to_see_auth_form(:login)
    end
  end
end
