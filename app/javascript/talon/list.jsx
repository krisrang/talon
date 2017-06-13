import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CSSTransitionGroup } from 'react-transition-group'

function Item(props) {
  let thumbnailStyle = {backgroundImage: "url(" + props.thumbnail_url + ")"}

  return (
    <div className="col-sm-12">
      <div className="media">
        <div className="media-left">
          <a href={props.url}>
            <div className="thumbnail">
              <div className="image" style={thumbnailStyle}></div>
            </div>
          </a>
        </div>
        <div className="media-body">
          <h4 className="media-heading">{props.title}</h4>
          {props.description}
        </div>
      </div>
    </div>
  )
}
Item.propTypes = {
  url: PropTypes.string.isRequired,
  thumbnail_url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}

class List extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let items = this.props.store.all().map((download) => <Item key={download.key} {...download} />)

    return (
      <div>
        <div className="downloadlist row">
          <CSSTransitionGroup
            transitionName="downloaditem"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {items}
          </CSSTransitionGroup>
        </div>
      </div>
    )
  }
}
List.propTypes = {
  store: PropTypes.object.isRequired,
  // showError: PropTypes.func.isRequired,
  // downloadsEndpoint: PropTypes.string.isRequired,
  // extractorsEndpoint: PropTypes.string.isRequired,
}

export default List
