export default {
  pad: function(num, size) {
    return ('00000' + num).substr(-size)
  },

  durationHuman(duration) {
    if (!duration) return null

    let sections = []
    let hours = Math.floor((duration %= 86400) / 3600)
    let minutes = Math.floor((duration %= 3600) / 60)
    let seconds = duration % 60

    if (hours) sections.push(this.pad(hours, 2))
    sections.push(this.pad(minutes, 2))
    sections.push(this.pad(seconds, 2))

    return sections.join(":")
  }
}
