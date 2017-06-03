import 'whatwg-fetch'
import React from 'react'
import Extractors from './extractors'
import Utils from './utils'
import imageNoise from '../images/noise.png'
import imageLoading from '../images/loading.svg'
import imageLogo from '../../assets/images/logo@2x.png'

class Downloader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingInfo: false,
      loadingStart: false,
      url: "",
      info: {},
      infoLoaded: false
    }

    this.handleUrlChange = this.handleUrlChange.bind(this)
    this.handleContinue = this.handleContinue.bind(this)
    this.handleStart = this.handleStart.bind(this)
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value})
  }

  handleContinue(e) {
    this.setState({loadingInfo: true})

    let data = {url: this.state.url};

    Utils.fetchPost(this.props.downloadsEndpoint, data)
    .then((json) => {
      json.durationHuman = this.durationHuman(json)
      this.setState({info: json, infoLoaded: true, loadingInfo: false, loadingStart: false, url: ""})
      $('#url').blur()
    })
  }

  handleStart(e) {
    this.setState({loadingStart: true})
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
    let buttonClass = "waves-effect waves-light green darken-3 btn"
    let noiseStyle = {background: "url('" + imageNoise + "')"}
    let backgroundStyle = {backgroundImage: "url('" + imageLogo + "')", backgroundSize: "initial"}

    if (this.state.infoLoaded) {
      downloaderClass += " loaded"
      backgroundStyle.backgroundImage = "url('" + this.state.info.thumbnail + "')"
      backgroundStyle.backgroundSize = "cover"
    }

    if (this.state.loadingInfo || this.state.url.length == 0) buttonClass += " disabled"
    if (this.state.loadingStart) downloaderInfoWrapperClass += " started"

    return (
      <div className="row white-text">
        <div className="background-container">
          <div>
            <div className="background" style={backgroundStyle}></div>
          </div>
          <div className="noise" style={noiseStyle}></div>
        </div>
        <div className={downloaderClass}>
          <form className="col s12">
            <div className="input-field col s10">
              <i className="material-icons prefix">input</i>
              <input id="url" type="text" onChange={this.handleUrlChange} value={this.state.url} />
              <label htmlFor="url">Video Address</label>
            </div>
            <div className="input-field col s2 center-align">
              { this.state.loadingInfo ?
                (<img src={imageLoading} />) :
                (<input type="submit" className={buttonClass} onClick={this.handleContinue} value="Load" />)
              }
            </div>
          </form>
          <div className="row">
            <form className="downloadinfo col s10 offset-s1">
              <div className={downloaderInfoWrapperClass}>
                <img className="thumbnail" src={this.state.info.thumbnail} />
                <h2><a href={this.state.info.webpage_url}>{this.state.info.title}</a></h2>
                <div className="duration">{this.state.info.durationHuman}</div>
                <div className="source">{this.state.info.extractor}</div>
                <p>Options here</p>
              </div>
              { this.state.loadingStart ?
                (<img src={imageLoading} className="col s12 downloadbtn" />) :
                (<a className="btn col s12 red downloadbtn" onClick={this.handleStart}>Start Download</a>)
              }
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Downloader
