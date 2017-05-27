require_dependency 'youtube_dl'

class DownloadsController < ApplicationController
  def intro
    @extractors = YoutubeDL.extractors
  end
end
