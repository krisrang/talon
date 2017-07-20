class DownloadMailer < ApplicationMailer
  def complete(id, email)
    @download = Download.find(id)
    @title = I18n.t('mailers.download.complete.title')
    @body = I18n.t('mailers.download.complete.template', link: @download.public_url)

    mail(to: email, subject: I18n.t('mailers.download.complete.subject')) do |format|
      format.text { render plain: @body }
    end
  end
end
