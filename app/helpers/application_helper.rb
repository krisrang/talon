require 'current_user'

module ApplicationHelper
  include CurrentUser
  
  def title(page_title)
    content_for(:title) { " #{page_title}" }
  end

  def client_include(preload={})
    user = logged_in? && !current_user.shadow? ? serialize(current_user) : nil
    
    data = {
      current_user: user,
      endpoints: {
        extractors: extractors_downloads_path,
        downloads: downloads_path,
        users: users_path,
        sessions: session_path,
        forgot_password: forgot_password_session_path,
      }
    }.merge(preload)

    (
      content_tag(:div, id: "talon", data: data.to_json) {} +
      stylesheet_pack_tag("talon") +
      javascript_pack_tag("talon")
    ).html_safe
  end

  def auto_link(text)
    if /.+\..+/.match?(text)
      link_to(text, "http://#{text}")
    else
      text
    end
  end
end
