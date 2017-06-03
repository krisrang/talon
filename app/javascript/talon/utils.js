import 'whatwg-fetch'

export default {
  fetchPost: function(url, data) {
    return fetch(url, {
      method: "POST",
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

  pad: function(num, size) {
    return ('00000' + num).substr(-size)
  }
}
