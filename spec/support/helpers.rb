module Helpers
  def log_in(fabricator=nil)
    user = Fabricate(fabricator || :user)
    log_in_user(user)
    user
  end
  
  def log_in_user(user)
    provider = Talon.current_user_provider.new(request.env)
    provider.log_on_user(user, session, cookies)
  end

  def clear_enqueued_jobs
    ActiveJob::Base.queue_adapter.enqueued_jobs.clear
  end

  def expect_job_type(klass, method)
    args = ActiveJob::Base.queue_adapter.enqueued_jobs.first[:args].dup
    expect(args.shift).to eq(klass)
    expect(args.shift).to eq(method)
  end

  def expect_no_jobs
    expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq(0)
  end

  def xhr(method, action, params={})
    send(method, action, xhr: true, params: params)
  end
end
