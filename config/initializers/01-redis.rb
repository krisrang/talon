if Rails.env.test?
  $redis.delete_prefixed ""
end
Talon.clear_caches!

if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|
    if forked
      # We're in smart spawning mode.
      Talon.after_fork
    else
      # We're in conservative spawning mode. We don't need to do anything.
    end
  end
end
