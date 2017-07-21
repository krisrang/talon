export const MessengerActionTypes = {
  RECEIVED: 'MESSENGER_RECEIVED'
}

class Messenger {
  constructor(channel, store) {
    this.channel = channel
    this.store = store
    this.receive = this.receive.bind(this)

    this.interval = setInterval(() => {
      if (document.readyState === "complete") {
        clearInterval(this.interval)
        MessageBus.subscribe(channel, this.receive)
      }
    }, 500)
  }

  receive(data) {
    this.store.dispatch({
      type: MessengerActionTypes.RECEIVED,
      payload: {
        ...data,
        channel: this.channel
      }
    })
  }
}

export default (channel, store) => new Messenger(channel, store)
