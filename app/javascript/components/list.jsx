import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CSSTransitionGroup } from 'react-transition-group'
import * as ActionTypes from '../actions'
import Item from './item'

class List extends React.PureComponent {
  constructor(props) {
    super(props)

    this.subscriptions = {}
    this.cable = window.TalonCable && window.TalonCable.cable
  }

  start(id) {
    let endpoint =  this.props.endpoints.downloads + "/" + id + "/start"
    this.props.downloadStart(endpoint, id)
  }

  subscribe(id) {
    if (this.subscriptions[id]) return

    this.subscriptions[id] = this.cable.subscriptions.create({channel: "DownloadChannel", id}, {
      received: (data) => {
        if (data.progress) this.props.downloadChanged(id, {percent: data.progress.percent})
        if (data.progress_label) this.props.downloadChanged(id, {progress_label: data.progress_label})
        if (data.lines) this.props.downloadChanged(id, {log: data.lines.join("\n")})

        // Download stop states
        if (data.public_url) {
          this.unsubscribe(id)
          this.props.downloadFinished(id, data.public_url)
        } else if (data.cancel) {
          this.unsubscribe(id)
          this.props.downloadCancelled(id)
        } else if (data.error) {
          this.unsubscribe(id)
          this.props.downloadErrored(id, data.error)
        }
      },

      rejected: () => {}
    })
  }

  unsubscribe(id) {
    if (this.subscriptions[id]) {
      this.cable.subscriptions.remove(this.subscriptions[id])
      delete this.subscriptions[id]
    }
  }

  cancel(id) {
    this.subscriptions[id] && this.subscriptions[id].send({action: "cancel"})
  }

  retry(id) {
    this.subscribe(id)
    this.start(id)
  }

  toggleLogs(id) {
    this.props.downloadLogsToggle(id)
  }

  toggleCopy(id) {
    this.props.downloadCopyToggle(id)
  }

  delete(id) {
    let endpoint = this.props.endpoints.downloads + "/" + id
    this.props.downloadDelete(endpoint, id)
  }

  renderItem(download) {    
    return <Item
      key={download.id}
      handleStart={() => this.start(download.id)}
      handleToggleLogs={() => this.toggleLogs(download.id)}
      handleToggleCopy={() => this.toggleCopy(download.id)}
      handleDelete={() => this.delete(download.id)}
      handleSubscribe={() => this.subscribe(download.id)}
      handleUnsubscribe={() => this.unsubscribe(download.id)}
      handleCancel={() => this.cancel(download.id)}
      handleRetry={() => this.retry(download.id)}
      {...download}
    />
  }

  render() {
    return (
      <div className="downloadlist">
        <CSSTransitionGroup
          transitionName="downloaditem"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
          {this.props.downloads.map((d) => this.renderItem(d))}
        </CSSTransitionGroup>
      </div>
    )
  }
}
List.propTypes = {
  downloads: PropTypes.array.isRequired,
  endpoints: PropTypes.object.isRequired,
  downloadStart: PropTypes.func.isRequired,
  downloadChanged: PropTypes.func.isRequired,
  downloadCopyToggle: PropTypes.func.isRequired,
  downloadLogsToggle: PropTypes.func.isRequired,
  downloadCancelled: PropTypes.func.isRequired,
  downloadErrored: PropTypes.func.isRequired,
  downloadDelete: PropTypes.func.isRequired,
  downloadFinished: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  downloads: state.downloads,
  endpoints: state.endpoints
})

export default connect(mapStateToProps, ActionTypes)(List)
