import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
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
import Utils from '../utils'

class Item extends React.PureComponent {
  componentWillMount() {
    this.props.handleSubscribe()
  }

  componentWillUnmount() {
    this.props.handleUnsubscribe()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  durationHuman(duration) {
    if (!duration) return null

    let sections = []
    let hours = Math.floor((duration %= 86400) / 3600)
    let minutes = Math.floor((duration %= 3600) / 60)
    let seconds = duration % 60

    if (hours) sections.push(Utils.pad(hours, 2))
    sections.push(Utils.pad(minutes, 2))
    sections.push(Utils.pad(seconds, 2))

    return sections.join(":")
  }

  handleDownload() {
    window.open(this.props.public_url, '_newtab')
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

        this.props.handleToggleCopy()
        setTimeout(() => {
          this.props.handleToggleCopy()
        }, 2000)
      }
    }
  }

  scrollToBottom() {
    if (this.preNode) this.preNode.scrollTop = 2000
  }

  render() {
    let {
      title,
      url,
      extractor,
      duration,
      progress_label,
      percent,
      initial,
      started,
      errored,
      finished,
      starting,
      logsExpanded,
      cancelled,
      copyActive,      
      public_url,      
      log,
      thumbnail_url,
      handleStart,
      handleToggleLogs,
      handleDelete,
      handleCancel,
      handleRetry,
    } = this.props

    duration = this.durationHuman(duration)

    let expandClass = classNames("expand", {"expandOpen": logsExpanded})
    let copybtnClass = classNames("copybtn", {"active": copyActive})
    
    return (
      <Card className="card">
        <div className="details">
          <CardContent className="content">
            <div className="title">
              <Typography type="headline">
                {title}
              </Typography>
              <a href={url}><OpenIcon /></a>
              <a onClick={handleDelete}><DeleteIcon /></a>
            </div>
            <Typography type="subheading" color="secondary">
              {extractor}
              {duration && (" - " + duration)}
            </Typography>
          </CardContent>
          <div className="controls">
            {(started || errored) && (
              <IconButton className={expandClass} onClick={handleToggleLogs}>
                <ExpandMoreIcon />
              </IconButton>
            )}
            {started && (
              <IconButton onClick={handleCancel}>
                <CancelIcon />
              </IconButton>
            )}
            <div className="widecontrols">
              {initial && (
                <div className="buttongrid">
                  <Button raised color="primary" onClick={handleStart}>
                    <PlayIcon />
                    {"Start"}
                  </Button>
                </div>
              )}
              {started && (
                <div>
                  <Typography type="body1" color="secondary" align="center">
                    {progress_label}
                  </Typography>
                  <LinearProgress mode={starting ? "indeterminate" : "determinate"} value={percent} className="progressbar" />
                </div>
              )}
              {finished && (
                <div className="buttongrid result">
                  <Button color="primary" onClick={() => this.handleDownload()}>
                    <DownloadIcon />
                    {"Download"}
                  </Button>
                  <Button dense onClick={() => this.handleCopy()} className={copybtnClass}>
                    <CopyIcon className="copyicon" />
                    <CheckIcon className="copyfeedback" />
                  </Button>
                  <Input defaultValue={public_url} className="finished-url" inputRef={node => this.finishInput = node} />
                </div>
              )}
              {cancelled && (
                <div className="buttongrid">
                  <Typography type="body2" color="secondary" align="right">
                    {"Download cancelled!"}
                  </Typography>
                  <div className="buttoncontainer">
                    <Button color="accent" onClick={handleRetry}>
                      <RetryIcon />
                      {"Retry"}
                    </Button>
                  </div>
                </div>
              )}
              {errored && (
                <div className="buttongrid">
                  <Typography type="body2" color="secondary" align="right">
                    {"Error downloading!"}
                  </Typography>
                  <div className="buttoncontainer">
                    <Button color="accent" onClick={handleRetry}>
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
          <div className="thumbnail" style={{backgroundImage: "url("+thumbnail_url+")"}} />
        </div>
        <Collapse className="logs" in={logsExpanded} transitionDuration="auto" unmountOnExit>
          <CardContent>
            <pre ref={node => this.preNode = node}>
              {log}
            </pre>
          </CardContent>
        </Collapse>
      </Card>
    )
  }
}
Item.propTypes = {
  id: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extractor: PropTypes.string.isRequired,
  duration: PropTypes.number,
  thumbnail_url: PropTypes.string,
  progress_label: PropTypes.string,
  percent: PropTypes.number,
  logsExpanded: PropTypes.bool,
  copyActive: PropTypes.bool,
  starting: PropTypes.bool,  
  public_url: PropTypes.string,  
  log: PropTypes.string,  
  initial: PropTypes.bool.isRequired,
  started: PropTypes.bool.isRequired,
  errored: PropTypes.bool.isRequired,
  finished: PropTypes.bool.isRequired,
  cancelled: PropTypes.bool.isRequired,
  handleStart: PropTypes.func.isRequired,
  handleSubscribe: PropTypes.func.isRequired,
  handleUnsubscribe: PropTypes.func.isRequired,
  handleToggleLogs: PropTypes.func.isRequired,
  handleToggleCopy: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleRetry: PropTypes.func.isRequired,
}

export default Item
