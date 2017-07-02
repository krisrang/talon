export default {
  pad: function(num, size) {
    return ('00000' + num).substr(-size)
  }
}
