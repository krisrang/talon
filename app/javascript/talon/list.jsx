import React from 'react'
import { Button } from 'react-bootstrap'
import Utils from './utils'

class Item extends React.Component {
  constructor(props) {
    super(props)
    this.store = props.store
    this.download = props.download

    this.handleDelete = this.handleDelete.bind(this)
  }

  handleDelete() {
    let url = [this.props.downloadsEndpoint, this.download.key].join("/")

    Utils.fetchDelete(url)
    .then((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.store.delete(this.download)
    })
    .catch((error) => {
      this.error(error)
    })
  }

  render() {
    let thumbnailStyle = {backgroundImage: "url('" + this.download.thumbnail_url + "')"}

    return (
      <div className="download media">
        <div className="media-left">
          <div className="media-object thumbnail" style={thumbnailStyle}></div>
        </div>
        <div className="media-body">
          <h4 className="media-heading">{this.download.title}</h4>
          {this.download.description}
          <Button onClick={this.handleDelete} bsStyle="danger">Delete</Button>
        </div>
      </div>
    )
  }
}

class List extends React.Component {
  constructor(props) {
    super(props)
    this.store = props.store

    this.state = {
      downloads: this.store.all()
    }
  }

  componentWillMount() {
    this.store.subscribe(() => this.updateDownloads())
  }

  componentWillUnmount() {
    this.store.unsubscribe(() => this.updateDownloads())
  }

  updateDownloads() {
    this.setState({ downloads: this.store.all() });
  }

  render() {
    if (this.store.downloads.length === 0) {
      return null
    }

    let downloads = this.store.downloads.sort((a, b) => {
      return b.id - a.id
    }).map((d) => {
      return <Item key={d.key} download={d} {...this.props} />
    })

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="downloadlist">
              {downloads}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default List
