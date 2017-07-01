import React from 'react'
import PropTypes from 'prop-types'
// import classNames from 'classnames'
import { CSSTransitionGroup } from 'react-transition-group'
import Item from './item'
import Utils from './utils'

class List extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      downloads: this.props.store.all()
    }

    this.storeUpdate = this.storeUpdate.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
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

  deleteItem(itemComponent) {
    let download = itemComponent.props.item
    let url = this.props.downloadsEndpoint + "/" + download.key

    Utils.requestDelete(url)
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.props.store.delete(itemComponent.props.item)
    })
    .fail((err) => {
      this.error(err.responseJSON ? err.responseJSON.error : err.responseText)
    })
  }

  error(message) {
    this.props.showError(message)
  }

  render() {
    let items = this.state.downloads.map((item) => <Item key={item.id} item={item} deleteItem={this.deleteItem} {...this.props} />)

    return (
      <div className="downloadlist" ref={(c) => { this.list = c }}>
        <CSSTransitionGroup
          transitionName="downloaditem"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
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
  showError: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
  extractorsEndpoint: PropTypes.string.isRequired,
}

export default List
