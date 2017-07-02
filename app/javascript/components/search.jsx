import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Paper from 'material-ui/Paper'
import { LinearProgress } from 'material-ui/Progress'
import IconButton from 'material-ui/IconButton'
import CancelIcon from 'material-ui-icons/Cancel'
import Videocam from 'material-ui-icons/Videocam'
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
    let { searchInput, loading, url, scrolled } = this.props
    let className = classNames("downloader", {"shadow": scrolled, "loading": loading})

    return (
      <Paper className={className} elevation={scrolled ? 2 : 0}>
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
            <IconButton onClick={() => this.handleReset()}>
              <CancelIcon />
            </IconButton>
          )}
          <input type="submit" className="submitbtn" />
        </form>
      </Paper>
    )
  }
}
Search.propTypes = {
  url: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  scrolled: PropTypes.bool.isRequired,
  endpoints: PropTypes.object.isRequired,
  searchStart: PropTypes.func.isRequired,
  searchInput: PropTypes.func.isRequired,
  searchReset: PropTypes.func.isRequired,
  listenScroll: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  ...state.search,
  scrolled: state.scrollStatus.scrolled,
  endpoints: state.endpoints
})

export default connect(mapStateToProps, ActionTypes)(Search)
