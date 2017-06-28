const EventEmitter = require('events')

class DownloadStore {
  constructor(initial) {
    this.downloads = initial || [];
    this.emitter = new EventEmitter()
  }

  subscribe(event, callback) {
    this.emitter.on(event, callback)
  }

  unsubscribe(event, callback) {
    this.emitter.removeListener(event, callback)
  }

  add(download) {
    this.downloads.push(download)
    this.emitter.emit('update', download)    
  }

  delete(download) {
    let index = this.downloads.indexOf(download);

    if (index > -1) {
      this.downloads.splice(index, 1);
      this.emitter.emit('update', download)
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
