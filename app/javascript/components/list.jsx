import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'
import * as ActionTypes from '../actions'
import Item from './item'

class List extends React.PureComponent {
  constructor(props) {
    super(props)

    this.subscriptions = {}
    this.cable = window.TalonCable && window.TalonCable.cable
  }

  start(id) {
    this.props.downloadStart(id)
  }

  subscribe(id) {
    if (this.subscriptions[id]) return

    this.subscriptions[id] = this.cable.subscriptions.create({channel: "DownloadChannel", id}, {
      received: (data) => {
        if (data.progress) {
          this.props.downloadProgress(id, data.progress, data.progress_label)
        }

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

  delete(id) {
    this.props.downloadDelete(id)
  }

  renderItem(download) {    
    return <Item
      handleStart={() => this.start(download.id)}
      handleDelete={() => this.delete(download.id)}
      handleSubscribe={() => this.subscribe(download.id)}
      handleUnsubscribe={() => this.unsubscribe(download.id)}
      handleCancel={() => this.cancel(download.id)}
      handleRetry={() => this.retry(download.id)}
      {...download}
    />
  }

  render() {
    const items = this.props.downloads.map((d) => (
      <CSSTransition
        key={d.uuid}
        classNames="downloaditem"
        timeout={500}>
        {this.renderItem(d)}
      </CSSTransition>
    ))

    return (
      <TransitionGroup className="downloadlist">
        {items}
      </TransitionGroup>
    )
  }
}
List.propTypes = {
  downloads: PropTypes.array.isRequired,
  downloadStart: PropTypes.func.isRequired,
  downloadProgress: PropTypes.func.isRequired,
  downloadCancelled: PropTypes.func.isRequired,
  downloadErrored: PropTypes.func.isRequired,
  downloadDelete: PropTypes.func.isRequired,
  downloadFinished: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  downloads: state.downloads,
})

export default connect(mapStateToProps, ActionTypes)(List)
