if Rails.env.test?
  $redis.delete_prefixed ""
end
