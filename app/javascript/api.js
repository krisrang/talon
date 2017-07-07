const apiFetch = (url, opts = {}) => {
  opts.credentials = 'same-origin'

  let request = new Request(url, opts)
  request.headers.set('X-Requested-With', 'XMLHttpRequest')

  if (request.method !== 'GET') {
    request.headers.set('Accept', "application/json")
    request.headers.set('Content-Type', "application/json")

    const csrfmeta = document.querySelector('meta[name="csrf-token"]')
    csrfmeta && request.headers.set('X-CSRF-Token', csrfmeta.content)
  }

  return fetch(request).then(response => {
    if (window.MiniProfiler && response.headers.has("X-MiniProfiler-Ids")) {
      let ids = JSON.parse(response.headers.get("X-MiniProfiler-Ids"))
      window.MiniProfiler.fetchResultsExposed(ids)
    }

    if (response.ok) {
      return response.json()
    } else if (response.status < 500) {
      return response.json().then(data => {
        throw data.error || data
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
      body: JSON.stringify(data)
    })
  },

  put: (url, data) => {
    return apiFetch(url, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  },

  delete: (url) => {
    return apiFetch(url, {
      method: "DELETE"
    })
  }
}
