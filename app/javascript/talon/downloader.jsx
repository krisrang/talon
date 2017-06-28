import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
// import { CSSTransitionGroup } from 'react-transition-group'
import Paper from 'material-ui/Paper'
import { LinearProgress } from 'material-ui/Progress'
import IconButton from 'material-ui/IconButton'
import CancelIcon from 'material-ui-icons/Cancel'
import Videocam from 'material-ui-icons/Videocam'
import Utils from './utils'

class Downloader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      url: "",
      scrollTop: 0
    }

    this.handleUrlChange = this.handleUrlChange.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.reset = this.reset.bind(this)
  }

  componentDidMount() {
    // this.setState({url: "https://www.giantbomb.com/videos/e3-2017-ace-combat-skies-unknown-trailer/2300-12109/"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=bXb1LQavaS8"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=E4s-hxY80pA"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=LCDgJiPBxfI"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=e5iGwE0XJ1s"}, this.handleLoad)

    // this.setState({loading: true})

    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount(){ 
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    this.setState({scrollTop: window.pageYOffset})
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value})
  }

  handleLoad(e) {
    e && e.preventDefault()

    this.formInput && this.formInput.blur()
    this.setState({loading: true})

    Utils.requestPost(this.props.downloadsEndpoint, {url: this.state.url})
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.props.addVideo(json)
      this.reset()
    })
    .fail((err) => {
      this.error(err.responseJSON ? err.responseJSON.error : err.responseText)
    })
  }

  error(message) {
    this.reset()
    this.props.showError(message)
  }

  reset() {
    this.setState({url: "", loading: false})
  }

  render() {
    let shadow = this.state.scrollTop !== 0
    let className = classNames("downloader", {"shadow": shadow, "loading": this.state.loading})
    let elevation = shadow ? 2 : 0
    let showCancel = !this.state.loading && this.state.url.length > 0

    return (
      <Paper className={className} elevation={elevation}>
        {/*<IconButton color="contrast" aria-label="Menu">
          <MenuIcon />
        </IconButton>*/}
        <form action="nowhere" onSubmit={this.handleLoad}>
          <Videocam className="input-decorator" />
          <LinearProgress className="progressbar" />
          <input id="url" type="text" placeholder="Video Address" disabled={this.state.loading}
            value={this.state.url} onChange={this.handleUrlChange}
            ref={(c) => { this.formInput = c }} />
          {showCancel && (
            <IconButton onClick={this.reset}>
              <CancelIcon />
            </IconButton>
          )}
          <input type="submit" className="submitbtn" />
        </form>
        {/*<Extractors extractorsEndpoint={this.props.extractorsEndpoint} />*/}
      </Paper>
    )
  }
}
Downloader.propTypes = {
  addVideo: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
  extractorsEndpoint: PropTypes.string.isRequired,
  // classes: PropTypes.object.isRequired,
}

export default Downloader
