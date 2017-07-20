import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Paper from 'material-ui/Paper'
import { LinearProgress } from 'material-ui/Progress'
import IconButton from 'material-ui/IconButton'
import CancelIcon from 'material-ui-icons/Cancel'
import Videocam from 'material-ui-icons/Videocam'
import MainMenu from './main_menu'
import UserBit from './user_bit'
import * as ActionTypes from '../actions'

class Search extends React.PureComponent {
  componentDidMount() {
    this.scrollUnsub = this.props.listenScroll()
  }

  componentWillUnmount() { 
    this.scrollUnsub && this.scrollUnsub()
  }

  handleLoad(e) {
    e.preventDefault()

    this.formInput.blur()
    this.props.searchStart(this.props.url)
  }

  handleReset() {
    this.props.searchReset()
    this.formInput.focus()
  }

  render() {
    const { searchInput, loading, url, scrolled, user, userLogout } = this.props
    const className = classNames("search", {"shadow": scrolled, "loading": loading})

    return (
      <Paper id="search" className={className} elevation={scrolled ? 4 : 0}>
        <MainMenu user={user} userLogout={userLogout} />
        <form action="nowhere" onSubmit={(e) => { this.handleLoad(e) }}>
          <Videocam className="input-decorator" />
          <LinearProgress className="progressbar" mode="query" />
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
        <UserBit user={user} userLogout={userLogout} />
      </Paper>
    )
  }
}
Search.propTypes = {
  url: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  scrolled: PropTypes.bool.isRequired,
  user: PropTypes.object,
  searchStart: PropTypes.func.isRequired,
  searchInput: PropTypes.func.isRequired,
  searchReset: PropTypes.func.isRequired,
  userLogout: PropTypes.func.isRequired,
  listenScroll: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  ...state.search,
  user: state.user,
  scrolled: state.scrollStatus.scrolled,
})

export default connect(mapStateToProps, ActionTypes)(Search)
