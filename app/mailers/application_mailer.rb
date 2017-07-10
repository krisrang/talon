class ApplicationMailer < ActionMailer::Base
  default from: "Talon <#{ENV['ACTION_MAILER_DEFAULT_FROM']}>", reply_to: "Talon <#{ENV['ACTION_MAILER_DEFAULT_FROM']}>"
  layout 'mailer'
end
