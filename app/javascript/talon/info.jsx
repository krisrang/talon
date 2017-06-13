import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Select from 'react-select'
import Utils from './utils'
import 'react-select/dist/react-select.css'

class Info extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      starting: false,
      started: false,
    }

    this.handleStart = this.handleStart.bind(this)
  }

  handleStart(e) {
    e && e.preventDefault()
    return

    this.setState({starting: true})

    let data = {url: this.props.url, start: true}

    Utils.requestPost(this.props.downloadsEndpoint, data)
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.props.store.add(json)
      this.setState({starting: false, started: true})
      setTimeout(() => {this.props.reset()}, 1000)
    })
    .fail((err) => {
      this.error(err.responseJSON ? err.responseJSON.error : err.responseText)
    })
  }

  error(message) {
    this.props.showError(message)
  }

  durationHuman(info) {
    let duration = info.duration
    let sections = []
    let hours = Math.floor((duration %= 86400) / 3600)
    let minutes = Math.floor((duration %= 3600) / 60)
    let seconds = duration % 60

    if (hours) sections.push(Utils.pad(hours, 2))
    sections.push(Utils.pad(minutes, 2))
    sections.push(Utils.pad(seconds, 2))

    return sections.join(":")
  }

  render() {
    let duration = this.durationHuman(this.props.info)
    let thumbnailStyle = {backgroundImage: "url(" + this.props.info.thumbnail_url + ")"}
    let infoClass = classNames(
      'downloadinfo',
      {starting: this.state.starting, started: this.state.started}
    )

    let videoFormats = []
    // let audioFormats = []

    this.props.info.formats.forEach((format) => {
      if (!format.video) return
      videoFormats.push({value: format.id, label: format.description})
    })

    return (
      <div className={infoClass}>
        <div className="info">
          <div className="background-container">
            <div className="background" style={thumbnailStyle}></div>
            <div className="background-split"></div>
            <div className="noise"></div>
          </div>
          <div className="thumbnail">
            <div className="image" style={thumbnailStyle}></div>
          </div>
          <div className="title">
            <h2><a href={this.props.info.url}>{this.props.info.title}</a></h2>
          </div>
          <div className="source">{this.props.info.extractor}</div>
          <div className="duration">{duration}</div>
          <div className="options">
            <Select placeholder="Video" options={videoFormats} />
            <Select placeholder="Audio" options={videoFormats} />
          </div>
          <div className="buttons">
            <a className="text-btn" onClick={this.props.reset}>Cancel</a>
            <a href="" className="text-btn" onClick={this.handleStart}>Download</a>
          </div>
        </div>
      </div>
    )
  }
}
Info.propTypes = {
  store: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
  info: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
}

export default Info
