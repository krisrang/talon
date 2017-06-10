export default {
  request: function(url, method, data) {
    return $.ajax(url, {
      method: method,
      data: JSON.stringify(data),
      dataType: 'json',
      headers: {
        "Content-Type": "application/json"
      }
    })
  },

  requestGet: function(url) {
    return this.request(url, "GET")
  },

  requestPost: function(url, data) {
    return this.request(url, "POST", data)
  },

  requestDelete: function(url) {
    return this.request(url, "DELETE")
  },

  pad: function(num, size) {
    return ('00000' + num).substr(-size)
  }
}
