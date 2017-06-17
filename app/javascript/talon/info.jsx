import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ProgressBar } from 'react-bootstrap'
import Utils from './utils'
import 'react-select/dist/react-select.css'

class Info extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      starting: false,
      started: false,
      progress: {
        percent: 0
      },
      progressLabel: "",
      uploading: false,
      finished_url: ""
    }

    this.handleStart = this.handleStart.bind(this)
  }

  handleStart(e) {
    e && e.preventDefault()

    this.setState({starting: true})

    let data = {url: this.props.url, start: true}

    ActionCable.createConsumer().subscriptions.create({channel: "DownloadChannel", key: this.props.info.key}, {
      received: (data) => {
        if (data.progress) {
          let update = {progress: data.progress}
          if (data.progress_label) update.progressLabel = data.progress_label
          this.setState(update)
        } else if (data.url) {
          this.setState({finished_url: data.url, started: false})
        } else if (data.error) {
          this.setState({progress: {}, started: false, finished_url: ""})
          this.error(data.error)
        } else {
          console.log(data)
        }
      }
    })

    Utils.requestPost(this.props.downloadsEndpoint, data)
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.setState({starting: false, started: true})
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
            Options
          </div>
          {this.state.started && (
            <div className="status">
              <ProgressBar now={this.state.progress.percent} />
              <div className="progresslabel">{this.state.progressLabel} {this.state.progress.percent}%</div>
            </div>
          )}
          <div className="url">
            {this.state.finished_url.length > 0 && (
              <div className="well">
                <a href={this.state.finished_url}>{this.state.finished_url}</a>
              </div>
            )}
          </div>
          {!this.state.started && this.state.finished_url.length === 0 && (
            <div className="buttons">
              <a className="text-btn" onClick={this.props.reset}>Cancel</a>
              <a className="text-btn" disabled={this.state.starting} onClick={this.handleStart}>{this.state.starting ? "Starting..." : "Download"}</a>
            </div>
          )}
          {this.state.finished_url.length > 0 && (
            <div className="buttons">
              <a className="text-btn" onClick={this.props.reset}>Close</a>
            </div>
          )}
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
