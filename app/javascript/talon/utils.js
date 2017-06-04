import 'whatwg-fetch'

export default {
  fetchRequest: function(url, method, data) {
    return fetch(url, {
      method: method,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
    .then((response) => {
      if (response.ok || response.status === 422) {
        return response.json()
      } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
      }
    })
  },

  fetchPost: function(url, data) {
    return this.fetchRequest(url, "POST", data)
  },

  fetchDelete: function(url) {
    return this.fetchRequest(url, "DELETE")
  },

  pad: function(num, size) {
    return ('00000' + num).substr(-size)
  }
}
