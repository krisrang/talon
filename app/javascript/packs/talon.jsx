import React from 'react'
import ReactDOM from 'react-dom'
import DownloadStore from '../talon/download_store'
import Downloader from '../talon/downloader'
import List from '../talon/list'
import '../styles'

class Talon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Downloader {...this.props} />
        <List {...this.props} />
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('talon')
  const data = JSON.parse(node.getAttribute('data'))
  data.store = new DownloadStore(data.downloads)

  ReactDOM.render(<Talon {...data} />, node)
})
