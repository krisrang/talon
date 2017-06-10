import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CSSTransitionGroup } from 'react-transition-group'
import Extractors from './extractors'
import Info from './info'
import Utils from './utils'

class Downloader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      loaded: false,
      url: "",
      info: {}
    }

    this.handleUrlChange = this.handleUrlChange.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
    this.reset = this.reset.bind(this)
  }

  componentDidMount() {
    // this.setState({url: "https://www.giantbomb.com/videos/e3-2017-ace-combat-skies-unknown-trailer/2300-12109/"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=bXb1LQavaS8"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=E4s-hxY80pA"}, this.handleLoad)
    // this.setState({url: "https://www.youtube.com/watch?v=LCDgJiPBxfI"}, this.handleLoad)
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value})
  }

  handleLoad() {
    this.setState({loading: true})

    Utils.requestPost(this.props.downloadsEndpoint, {url: this.state.url})
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.setState({info: json, loaded: true, loading: false})
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
    this.setState({url: "", loaded: false, loading: false})
  }

  render() {
    let info = null
    let backgroundStyle = {}

    let backgroundClass = classNames(
      'background-container',
      {loaded: this.state.loaded}
    )

    let downloaderClass = classNames(
      'downloader', 'container',
      {loading: this.state.loading, loaded: this.state.loaded}
    )

    let urlDisabled = this.state.loading
    let loadBtnDisabled = this.state.loading || this.state.url.length == 0

    if (this.state.loaded) {
      backgroundStyle.backgroundImage = "url('" + this.state.info.thumbnail_url + "')"
      info = <Info key={this.state.info.url} info={this.state.info} url={this.state.url} reset={this.reset} {...this.props} />
    }

    return (
      <div>
        <div className={backgroundClass}>
          <div>
            <div className="background-initial"></div>
            <div className="background" style={backgroundStyle}></div>
          </div>
          <div className="noise"></div>
        </div>
        <div className={downloaderClass}>
          <form className="form url-form row">
            <div className="col-sm-10">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="fa fa-youtube-play"></i>
                </span>
                <input id="url" autoFocus="true" autoComplete="off" type="text" className="form-control"
                  onChange={this.handleUrlChange} value={this.state.url}
                  placeholder="Video Address" disabled={urlDisabled}
                />
              </div>
              <Extractors extractorsEndpoint={this.props.extractorsEndpoint} />
            </div>
            <div className="col-sm-2 text-center">
              { this.state.loading ?
                (<i className="loading-spinner fa fa-circle-o-notch fa-spin fa-2x fa-fw"></i>) :
                (<input type="submit" className="btn btn-success loadbtn" disabled={loadBtnDisabled} onClick={this.handleLoad} value="Load" />)
              }
            </div>
          </form>
        </div>
        <CSSTransitionGroup
          transitionName="downloadinfo"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {info}
        </CSSTransitionGroup>
      </div>
    )
  }
}
Downloader.propTypes = {
  // store: PropTypes.object.isRequired,
  showError: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
  extractorsEndpoint: PropTypes.string.isRequired,
}

export default Downloader
