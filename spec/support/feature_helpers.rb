module FeatureHelpers
  def expect_to_see_auth_form(type)
    expect(page).to have_selector("##{type}.authcard")
  end
end
