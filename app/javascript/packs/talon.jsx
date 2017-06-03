import 'whatwg-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import DownloadStore from '../talon/download_store'
import Downloader from '../talon/downloader'
import '../styles'

class List extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    // if (!this.props.list) {
    //   return null
    // }

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="downloadlist">
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
