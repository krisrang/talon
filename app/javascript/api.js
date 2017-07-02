const apiFetch = (url, opts = {}) => {
  return fetch(url, opts).then(response => {
    if (window.MiniProfiler && response.headers.has("X-MiniProfiler-Ids")) {
      let ids = JSON.parse(response.headers.get("X-MiniProfiler-Ids"))
      window.MiniProfiler.fetchResultsExposed(ids)
    }

    if (response.ok) {
      return response.json()
    } else if (response.status < 500) {
      return response.json().then(data => {
        throw data.error
      })
    } else {
      throw response.statusText
    }
  })
}

export default {
  get: (url) => {
    return apiFetch(url)
  },

  post: (url, data) => {
    return apiFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"},
      credentials: "same-origin"
    })
  },

  delete: (url) => {
    return apiFetch(url, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      credentials: "same-origin"
    })
  }
}
