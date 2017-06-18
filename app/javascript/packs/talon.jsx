import Raven from 'raven-js'
import React from 'react'
import ReactDOM from 'react-dom'
import { Modal, Button } from 'react-bootstrap'
import DownloadStore from '../talon/download_store'
import Downloader from '../talon/downloader'
import '../styles'

class Talon extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      errorOpen: false,
      error: ""
    }

    this.error = this.error.bind(this)
    this.closeError = this.closeError.bind(this)
  }

  error(message) {
    this.setState({ errorOpen: true, error: message })
  }

  closeError() {
    this.setState({ errorOpen: false, error: "" })
  }

  render() {
    return (
      <div>
        <Downloader showError={this.error} {...this.props} />
        <Modal show={this.state.errorOpen} onHide={this.closeError}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.error}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeError}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('talon')
  const data = JSON.parse(node.getAttribute('data'))
  data.store = new DownloadStore(data.downloads)

  if (data.env === "production") {
    Raven.config('https://ea53cac4219a4e56bc615fc0871777e4@sentry.io/180841').install()
  }

  ReactDOM.render(<Talon {...data} />, node)
})
