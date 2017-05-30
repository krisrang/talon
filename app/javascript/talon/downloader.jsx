import 'whatwg-fetch'
import React from 'react'
import Extractors from './extractors'
import Utils from './utils'
import loadingIcon from '../images/loading.svg'

class Downloader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      url: "",
      info: null
    }

    this.handleUrlChange = this.handleUrlChange.bind(this)
    this.handleContinue = this.handleContinue.bind(this)
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value})
  }

  handleContinue(e) {
    e.preventDefault()
    this.setState({loading: true})

    let data = {url: this.state.url};

    Utils.fetchPost(this.props.downloadsEndpoint, data)
    .then((json) => {
      this.setState({info: json, loading: false, url: ""})
      $('#url').blur()
    })
  }

  render() {
    let downloadInfo = ""

    if (this.state.info) {
      downloadInfo = (
        <div className="row">
          <div className="col s12">
            <img src={this.state.info.thumbnail} width="400px" />
            <p>Filename: {this.state.info._filename}</p>
          </div>
          <a className="btn col s12 red">Start Download</a>
        </div>
      )
    }

    let buttonClass = "waves-effect waves-light blue darken-3 btn"
    if (this.state.loading || this.state.url.length == 0) buttonClass += " disabled"

    return (
      <div className="row blue white-text">
        <div className="downloader container">
          <form className="col s12">
            <div className="input-field col s10">
              <input id="url" type="text" onChange={this.handleUrlChange} value={this.state.url} />
              <label htmlFor="url">Video Address</label>
            </div>
            <div className="input-field col s2 center-align">
              { this.state.loading ?
                (<img src={loadingIcon} />) :
                (<input type="submit" className={buttonClass} onClick={this.handleContinue} value="Load" />)
              }
            </div>
          </form>
          {downloadInfo}
        </div>
      </div>
    )
  }
}

export default Downloader
