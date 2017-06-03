import 'whatwg-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import DownloadStore from '../talon/download_store'
import Downloader from '../talon/downloader'
import '../styles'

class List extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className="row">
        <div className="container">
          <div className="col s12">
            <div className="downloadlist white z-depth-1">
              Downloads
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Talon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Downloader {...this.props} />
        <List />
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('talon')
  const data = JSON.parse(node.getAttribute('data'))
  data.store = new DownloadStore()

  ReactDOM.render(<Talon {...data} />, node)
})
