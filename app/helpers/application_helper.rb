require 'current_user'

module ApplicationHelper
  include CurrentUser
  
  def title(page_title)
    content_for(:title) { " #{page_title}" }
  end
end
