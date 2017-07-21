import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'
import * as ActionTypes from '../actions'
import Item from './item'

class List extends React.PureComponent {
  start(id) {
    this.props.downloadStart(id)
  }

  cancel(id) {
    this.props.downloadCancel(id)
  }

  delete(id) {
    this.props.downloadDelete(id)
  }

  renderItem(download) {    
    return <Item
      handleStart={() => this.start(download.id)}
      handleDelete={() => this.delete(download.id)}
      handleCancel={() => this.cancel(download.id)}
      handleRetry={() => this.start(download.id)}
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
  downloadCancel: PropTypes.func.isRequired,
  downloadDelete: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  downloads: state.downloads,
})

export default connect(mapStateToProps, ActionTypes)(List)
