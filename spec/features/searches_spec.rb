require 'rails_helper'

RSpec.feature "Searches", type: :feature, js: true do
  scenario "User visits index" do
    visit "/"

    expect(page).to have_selector(".search form input")
  end
end
