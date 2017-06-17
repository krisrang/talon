import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CSSTransitionGroup } from 'react-transition-group'
import Extractors from './extractors'
import Info from './info'
// import List from './list'
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
    // this.setState({url: "https://www.youtube.com/watch?v=e5iGwE0XJ1s"}, this.handleLoad)
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value})
  }

  handleLoad(e) {
    e && e.preventDefault()

    this.setState({loading: true})

    Utils.requestPost(this.props.downloadsEndpoint, {url: this.state.url})
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }

      this.setState({info: json, loading: false})
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
    this.setState({url: "", loading: false, info: {}})
  }

  render() {
    let info = null

    let downloaderClass = classNames(
      'downloader', {loading: this.state.loading}
    )

    if (this.state.info.url) {
      info = <Info key={this.state.info.url} info={this.state.info} url={this.state.url} reset={this.reset} {...this.props} />
    }

    return (
      <div>
        <div className="background-container">
          <div className="background-initial"></div>
          <div className="noise"></div>
        </div>
        <div className={downloaderClass}>
          <div className="container">
            <form className="form url-form row" onSubmit={this.handleLoad}>
              <div className="col-sm-12">
                <div className="input-floater-left">
                  { this.state.loading ?
                    (<i className="loading-spinner fa fa-circle-o-notch fa-spin fa-fw"></i>) :
                    (<i className="fa fa-youtube-play"></i>)
                  }
                </div>
                <input id="url" autoFocus="true" autoComplete="off" type="text" className="form-control"
                  onChange={this.handleUrlChange} value={this.state.url}
                  placeholder="Video Address" disabled={this.state.loading}
                />
                <div className="input-floater-right">
                  <Extractors extractorsEndpoint={this.props.extractorsEndpoint} />
                </div>
              </div>              
            </form>
          </div>
        </div>
        <CSSTransitionGroup
          transitionName="downloadinfo"
          transitionEnterTimeout={900}
          transitionLeaveTimeout={900}>
          {info}
        </CSSTransitionGroup>
        
        {/*<div className="list-container container">
          <List {...this.props} />
        </div>*/}
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
