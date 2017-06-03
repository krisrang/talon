import 'whatwg-fetch'
import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import Extractors from './extractors'
import Utils from './utils'
import imageNoise from '../images/noise.png'
import imageLoading from '../images/loading.svg'
import imageLogo from '../../assets/images/logo@2x.png'

function DownloadBtn(props) {
  if (props.loadingStart) {
    return <img src={imageLoading} className="col-sm-12 downloadbtn" />
  } else {
    return <a className="btn col-sm-12 btn-danger downloadbtn" onClick={props.handleStart}>Start Download</a>
  }
}

class Downloader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingInfo: false,
      loadingStart: false,
      started: false,
      url: "",
      info: {},
      infoLoaded: false,
      error: null,
      errorOpen: false
    }

    this.handleUrlChange = this.handleUrlChange.bind(this)
    this.handleContinue = this.handleContinue.bind(this)
    this.handleStart = this.handleStart.bind(this)
    this.closeError = this.closeError.bind(this)
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value})
  }

  handleContinue(e) {
    this.setState({loadingInfo: true})

    let data = {url: this.state.url}

    Utils.fetchPost(this.props.downloadsEndpoint, data)
    .then((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      json.durationHuman = this.durationHuman(json)
      this.setState({info: json, infoLoaded: true, loadingInfo: false, loadingStart: false})
    })
    .catch((error) => {
      this.error(json.error)
    })
  }

  handleStart(e) {
    this.setState({loadingStart: true})

    let data = {url: this.state.url, start: true}

    Utils.fetchPost(this.props.downloadsEndpoint, data)
    .then((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.setState({loadingStart: false, started: true})
      setTimeout(() => {this.reset()}, 1000)
    })
    .catch((error) => {
      this.error(json.error)
    })
  }

  error(err) {
    this.reset()
    this.setState({ errorOpen: true, error: err })
  }

  closeError() {
    this.setState({ errorOpen: false })
  }

  reset() {
    this.setState({url: "", infoLoaded: false, loadingInfo: false, loadingStart: false, started: false})
  }

  durationHuman(info) {
    let duration = info.duration
    let sections = []
    let hours = Math.floor((duration %= 86400) / 3600)
    let minutes = Math.floor((duration %= 3600) / 60)
    let seconds = duration % 60

    if (hours) sections.push(Utils.pad(hours, 2))
    if (minutes) sections.push(Utils.pad(minutes, 2))
    sections.push(Utils.pad(seconds, 2))

    return sections.join(":")
  }

  render() {
    let downloaderClass = "downloader container"
    let downloaderInfoWrapperClass = "downloadinfo-wrapper"
    let buttonClass = "btn btn-success"
    let noiseStyle = {background: "url('" + imageNoise + "')"}
    let backgroundStyle = {backgroundImage: "url('" + imageLogo + "')", backgroundSize: "initial"}

    if (this.state.infoLoaded) {
      downloaderClass += " loaded"
      backgroundStyle.backgroundImage = "url('" + this.state.info.thumbnail + "')"
      backgroundStyle.backgroundSize = "cover"
    }

    if (this.state.loadingInfo || this.state.url.length == 0) buttonClass += " disabled"
    if (this.state.started) downloaderInfoWrapperClass += " started"

    return (
      <div>
        <div className="background-container">
          <div>
            <div className="background" style={backgroundStyle}></div>
          </div>
          <div className="noise" style={noiseStyle}></div>
        </div>
        <div className={downloaderClass}>
          <div className="row">
            <form className="col-sm-12">
              <div className="form-group col-sm-10">
                <i className="fa fa-external-link"></i>
                <input id="url" type="text" className="form-control" onChange={this.handleUrlChange} value={this.state.url} placeholder="Video Address" />
                <Extractors hide={this.state.infoLoaded} extractorsEndpoint={this.props.extractorsEndpoint} />
              </div>
              <div className="form-group col-sm-2 text-center">
                { this.state.loadingInfo ?
                  (<img src={imageLoading} />) :
                  (<input type="submit" className={buttonClass} onClick={this.handleContinue} value="Load" />)
                }
              </div>
            </form>
          </div>
          <div className="row">
            <form className="downloadinfo col-sm-10 col-sm-offset-1">
              <div className={downloaderInfoWrapperClass}>
                <img className="thumbnail" src={this.state.info.thumbnail} />
                <h2><a href={this.state.info.webpage_url}>{this.state.info.title}</a></h2>
                <div className="duration">{this.state.info.durationHuman}</div>
                <div className="source">{this.state.info.extractor}</div>
                <div className="description"><pre>{this.state.info.description}</pre></div>
                <p>Options here</p>
              </div>
              {!this.state.started && (<DownloadBtn loadingStart={this.state.loadingStart} handleStart={this.handleStart} />)}
            </form>
          </div>
        </div>
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

export default Downloader
