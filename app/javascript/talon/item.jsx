import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
// import { CSSTransitionGroup } from 'react-transition-group'
import Card, { CardContent } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import { LinearProgress } from 'material-ui/Progress'
import Input from 'material-ui/Input/Input'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import Collapse from 'material-ui/transitions/Collapse'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import CopyIcon from 'material-ui-icons/ContentCopy'
import CancelIcon from 'material-ui-icons/Cancel'
import RetryIcon from 'material-ui-icons/Loop'
import DownloadIcon from 'material-ui-icons/FileDownload'
import PlayIcon from 'material-ui-icons/PlayArrow'
import OpenIcon from 'material-ui-icons/OpenInNew'
import CheckIcon from 'material-ui-icons/CheckCircle'
import DeleteIcon from 'material-ui-icons/Delete'
import Utils from './utils'

class Item extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      ...props.item,
      expanded: false,
      starting: false,
      copyActive: false,
      menuOpen: false,
      menuAnchor: undefined
    }

    this.startDownload = this.startDownload.bind(this)
    this.handleExpandClick = this.handleExpandClick.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleDownload = this.handleDownload.bind(this)
    this.handleRetry = this.handleRetry.bind(this)
    this.handleCopy = this.handleCopy.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  componentWillMount() {
    this.subscribe()
  }

  componentDidMount() {
    // this.error("Test error")
    // this.setState({cancelled: true})
    // this.setState({finished_url: "https://storage.googleapis.com/talon-eu/9483dea7.mkv", finished: true})
  }

  componentWillUnmount(){ 
    // this.unsubscribe()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  subscribe() {
    if (this.subscription) return

    this.subscription = this.props.consumer.subscriptions.create({channel: "DownloadChannel", key: this.state.key}, {
      received: (data) => {
        if (data.progress && data.progress.percent < 100 && data.progress.percent === this.state.percent) {
          return;
        }
        
        this.setState({starting: false})

        if (data.progress) this.setState({percent: data.progress.percent})
        if (data.progress_label) this.setState({progress_label: data.progress_label})
        if (data.lines) this.setState({log: data.lines.join("\n")})

        // Download stop states
        if (data.public_url) {
          this.unsubscribe()
          this.setState({public_url: data.public_url, expanded: false, finished: true, started: false})
        } else if (data.cancel) {
          this.unsubscribe()
          this.setState({cancelled: true, expanded: false, started: false})
        } else if (data.error) {
          this.unsubscribe()
          this.setState({percent: 0, started: false, public_url: ""})
          this.error(data.error)
        }
      }
    })
  }

  unsubscribe() {
    if (this.subscription) {
      this.props.consumer.subscriptions.remove(this.subscription)
      this.subscription = null
    }
  }

  startDownload() {
    this.setState({initial: false, starting: true, started: true, cancelled: false, error: false, progress_label: "Waiting for download to start..."})

    let url = this.props.downloadsEndpoint + "/" + this.state.key + "/start"

    Utils.requestPost(url)
    .done((json) => {
      if (json.error) {
        this.error(json.error)
        return
      }
    })
    .fail((err) => {
      this.error(err.responseJSON ? err.responseJSON.error : err.responseText)
    })
  }

  error(message) {
    this.setState({errored: true, expanded: true, log: message})
  }

  durationHuman(item) {
    if (!item.duration) return null

    let duration = item.duration
    let sections = []
    let hours = Math.floor((duration %= 86400) / 3600)
    let minutes = Math.floor((duration %= 3600) / 60)
    let seconds = duration % 60

    if (hours) sections.push(Utils.pad(hours, 2))
    sections.push(Utils.pad(minutes, 2))
    sections.push(Utils.pad(seconds, 2))

    return sections.join(":")
  }

  handleExpandClick() {
    this.setState({ expanded: !this.state.expanded })
  }

  handleCancel() {
    this.subscription && this.subscription.send({action: "cancel"})
  }

  handleDownload() {
    window.open(this.state.finished_url, '_newtab')
  }

  handleRetry() {
    this.subscribe()
    this.startDownload()
  }

  handleCopy() {
    if (this.finishInput) {
      let ios = navigator.userAgent.match(/ipad|ipod|iphone/i)

      if (ios) {
        let el = this.finishInput
        let editable = el.contentEditable
        let readOnly = el.readOnly
        el.contentEditable = true
        el.readOnly = false
        let range = document.createRange()
        range.selectNodeContents(el)
        let sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        el.setSelectionRange(0, 999999)
        el.contentEditable = editable
        el.readOnly = readOnly
      } else {
        this.finishInput.focus()
        this.finishInput.select()
      }

      if (!ios && document.queryCommandEnabled("copy") && document.execCommand('copy')) {
        this.finishInput.blur()

        this.setState({copyActive: true})
        setTimeout(() => {
          this.setState({copyActive: false})
        }, 2000)
      }
    }
  }

  handleDelete() {
    this.unsubscribe()
    this.props.deleteItem(this)
  }

  scrollToBottom() {
    if (this.preNode) this.preNode.scrollTop = 2000
  }

  render() {
    let expandClass = classNames("expand", {"expandOpen": this.state.expanded})
    let copybtnClass = classNames("copybtn", {"active": this.state.copyActive})
    let progressMode = this.state.starting ? "indeterminate" : "determinate"
    let duration = this.durationHuman(this.state)

    return (
      <Card className="card">
        <div className="details">
          <CardContent className="content">
            <div className="title">
              <Typography type="headline">
                {this.state.title}
              </Typography>
              <a href={this.state.url}><OpenIcon /></a>
              <a onClick={this.handleDelete}><DeleteIcon /></a>
            </div>
            <Typography type="subheading" color="secondary">
              {this.state.extractor}
              {duration && (" - " + duration)}
            </Typography>
          </CardContent>
          <div className="controls">
            {(this.state.started || this.state.errored) && (
              <IconButton className={expandClass} onClick={this.handleExpandClick}>
                <ExpandMoreIcon />
              </IconButton>
            )}
            {this.state.started && (
              <IconButton onClick={this.handleCancel}>
                <CancelIcon />
              </IconButton>
            )}
            <div className="widecontrols">
              {this.state.initial && (
                <div className="buttongrid">
                  <Button raised color="primary" onClick={this.startDownload}>
                    <PlayIcon />
                    {"Start"}
                  </Button>
                </div>
              )}
              {this.state.started && (
                <div>
                  <Typography type="body1" color="secondary" align="center">
                    {this.state.progress_label}
                  </Typography>
                  <LinearProgress mode={progressMode} value={this.state.percent} className="progressbar" />
                </div>
              )}
              {this.state.finished && (
                <div className="buttongrid result">
                  <Button color="primary" onClick={this.handleDownload}>
                    <DownloadIcon />
                    {"Download"}
                  </Button>
                  <Button dense onClick={this.handleCopy} className={copybtnClass}>
                    <CopyIcon className="copyicon" />
                    <CheckIcon className="copyfeedback" />
                  </Button>
                  <Input defaultValue={this.state.public_url} className="finished-url" inputRef={node => this.finishInput = node} />
                </div>
              )}
              {this.state.cancelled && (
                <div className="buttongrid">
                  <Typography type="body2" color="secondary" align="right">
                    {"Download cancelled!"}
                  </Typography>
                  <div className="buttoncontainer">
                    <Button color="accent" onClick={this.handleRetry}>
                      <RetryIcon />
                      {"Retry"}
                    </Button>
                  </div>
                </div>
              )}
              {this.state.errored && (
                <div className="buttongrid">
                  <Typography type="body2" color="secondary" align="right">
                    {"Error downloading!"}
                  </Typography>
                  <div className="buttoncontainer">
                    <Button color="accent" onClick={this.handleRetry}>
                      <RetryIcon />
                      {"Retry"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="cover">
          <div className="thumbnail" style={{backgroundImage: "url("+this.state.thumbnail_url+")"}} />
        </div>
        <Collapse className="logs" in={this.state.expanded} transitionDuration="auto" unmountOnExit>
          <CardContent>
            <pre ref={node => this.preNode = node}>
              {this.state.log}
            </pre>
          </CardContent>
        </Collapse>
      </Card>
    )
  }
}
Item.propTypes = {
  // classes: PropTypes.object.isRequired,
  consumer: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  deleteItem: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
}

export default Item
