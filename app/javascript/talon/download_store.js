let EventEmitter = require('events').EventEmitter

class DownloadStore {
  constructor() {
    this.downloads = [];
    this.emitter = new EventEmitter()

    ActionCable.createConsumer().subscriptions.create("DownloadChannel", {
      received: function(data) {
        console.log(data);
      }
    })
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback)
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback)
  }

  add(download) {
    this.downloads.push(download)
    this.emitter.emit('update')
  }

  downloads() {
    return this.downloads.concat()
  }
}

export default DownloadStore
