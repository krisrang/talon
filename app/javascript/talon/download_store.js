let EventEmitter = require('events').EventEmitter

class DownloadStore {
  constructor(initial) {
    this.downloads = initial || [];
    this.emitter = new EventEmitter()

    // ActionCable.createConsumer().subscriptions.create("DownloadChannel", {
    //   received: function(data) {
    //     console.log(data);
    //   }
    // })
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

  delete(download) {
    let index = this.downloads.indexOf(download);

    if (index > -1) {
      this.downloads.splice(index, 1);
      this.emitter.emit('update')
    }
  }

  all() {
    return this.downloads.concat()
  }

  count() {
    return this.downloads.length
  }
}

export default DownloadStore
