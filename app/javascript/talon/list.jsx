import React from 'react'
import PropTypes from 'prop-types'
// import classNames from 'classnames'
import { CSSTransitionGroup } from 'react-transition-group'
import Item from './item'

class List extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      downloads: this.props.store.all()
    }

    this.storeUpdate = this.storeUpdate.bind(this)
  }

  componentWillMount() { 
    this.props.store.subscribe("update", this.storeUpdate)
  }

  componentWillUnmount(){ 
    this.props.store.unsubscribe("update", this.storeUpdate)
  }

  storeUpdate() {
    this.setState({downloads: this.props.store.all()})
  }

  render() {
    let items = this.state.downloads.map((item) => <Item key={item.id} item={item} {...this.props} />)

    return (
      <div className="downloadlist" ref={(c) => { this.list = c }}>
        <CSSTransitionGroup
          transitionName="downloaditem"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}>
          {items}
        </CSSTransitionGroup>
      </div>
    )
  }
}
List.propTypes = {
  // classes: PropTypes.object.isRequired,
  consumer: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  // showError: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
  extractorsEndpoint: PropTypes.string.isRequired,
}

export default List
