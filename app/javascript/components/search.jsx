import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Paper from 'material-ui/Paper'
import { LinearProgress } from 'material-ui/Progress'
import IconButton from 'material-ui/IconButton'
import CancelIcon from 'material-ui-icons/Cancel'
import Videocam from 'material-ui-icons/Videocam'
import UserBit from './user_bit'
import * as ActionTypes from '../actions'

class Search extends React.PureComponent {
  componentDidMount() {
    this.scrollUnsub = this.props.listenScroll()
  }

  componentWillUnmount(){ 
    this.scrollUnsub && this.scrollUnsub()
  }

  handleLoad(e) {
    e.preventDefault()

    this.formInput.blur()
    this.props.searchStart(this.props.endpoints.downloads, this.props.url)
  }

  handleReset() {
    this.props.searchReset()
    this.formInput.focus()
  }

  render() {
    const { searchInput, loading, url, scrolled, user, history, endpoints, userLogout } = this.props
    const className = classNames("search", {"shadow": scrolled, "loading": loading})
    

    return (
      <Paper id="search" className={className} elevation={scrolled ? 2 : 0}>
        <form action="nowhere" onSubmit={(e) => { this.handleLoad(e) }}>
          <Videocam className="input-decorator" />
          <LinearProgress className="progressbar" />
          <input
            id="url"
            type="text" placeholder="Video Address"
            disabled={loading}
            value={url}
            onChange={(e) => {searchInput(e.target.value)}}
            ref={(c) => { this.formInput = c }}
          />
          {(!loading && url) && (
            <IconButton className="clearbtn" onClick={() => this.handleReset()}>
              <CancelIcon />
            </IconButton>
          )}
          <input type="submit" className="submitbtn" />
        </form>
        <UserBit user={user} history={history} endpoints={endpoints} userLogout={userLogout} />
      </Paper>
    )
  }
}
Search.propTypes = {
  url: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  scrolled: PropTypes.bool.isRequired,
  endpoints: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object,
  searchStart: PropTypes.func.isRequired,
  searchInput: PropTypes.func.isRequired,
  searchReset: PropTypes.func.isRequired,
  listenScroll: PropTypes.func.isRequired,
  userLogout: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  ...state.search,
  user: state.user,
  scrolled: state.scrollStatus.scrolled,
  endpoints: state.endpoints
})

export default connect(mapStateToProps, ActionTypes)(Search)
