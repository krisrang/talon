class Redis
  class Store
    def delete_prefixed(prefix)
      keys("#{prefix}*").each { |k| del(k) }
    end
  end
end
