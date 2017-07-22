import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card'
import Menu, { MenuItem } from 'material-ui/Menu'
import { LinearProgress } from 'material-ui/Progress'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Typography from 'material-ui/Typography'
import CheckIcon from 'material-ui-icons/Check'
import ErrorIcon from 'material-ui-icons/ErrorOutline'
import MoreIcon from 'material-ui-icons/MoreVert'
import DropboxSaver from './dropbox_saver'
import GDrive from './gdrive'
import Utils from '../utils'

class Item extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      menuAnchor: null,
      menuOpen: false,
      dropbox: false,
    }

    this.showDropbox = this.showDropbox.bind(this)
    this.hideDropbox = this.hideDropbox.bind(this)
    this.handleMenuOpen = this.handleMenuOpen.bind(this)
    this.handleMenuClose = this.handleMenuClose.bind(this)
    this.showDrive = this.showDrive.bind(this)
    this.hideDrive = this.hideDrive.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleDownload(e) {
    e && e.preventDefault()
    window.open(this.props.public_url, '_newtab')
  }

  handleDelete() {
    this.handleMenuClose()
    this.props.handleDelete()
  }

  handleCopy() {
    if (this.finishInput) {
      const ios = navigator.userAgent.match(/ipad|ipod|iphone/i)

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

      if (document.queryCommandEnabled("copy") && document.execCommand('copy')) {
        if (!ios) {
          this.finishInput.blur()

          // this.props.handleToggleCopy()
          // setTimeout(() => {
          //   this.props.handleToggleCopy()
          // }, 2000)
        }
      }
    }
  }
  
  handleMenuOpen(e) {
    this.setState({menuOpen: true, menuAnchor: e.currentTarget})
  }

  handleMenuClose() {
    this.setState({menuOpen: false})
  }

  showDropbox() {
    if (!this.props.finished) {
      return
    }

    this.setState({menuOpen: false, dropbox: true})
  }

  hideDropbox() {
    this.setState({dropbox: false})
  }

  showDrive() {
    if (!this.props.finished) {
      return
    }

    this.setState({menuOpen: false, gdrive: true})
  }

  hideDrive() {
    this.setState({gdrive: false})
  }

  render() {
    const {
      title,
      audio,
      thumbnail_url,
      public_url,
      filename,
      extractor,
      percent,
      initial,
      started,
      errored,
      cancelled,
      finished,
      finishing,
      deleting,
      handleDelete,
      handleCancel,
      handleRetry,
    } = this.props

    const duration = Utils.durationHuman(this.props.duration)
    const deleteEnabled = (finished || errored || cancelled)
    
    return (
      <Card className={classNames("download", {deleting})}>
        <CardMedia className="cover-wrapper">
          <div className={classNames("cover", {"overlay": !finished, finishing})}>
            <div className="thumbnail" style={{backgroundImage: "url("+thumbnail_url+")"}} />
            {(initial || started || finishing) && <div className="status percent">{(percent || 0)+"%"}</div>}
            {finishing && <div className="status"><CheckIcon className="checkicon" /></div>}
            {(errored || cancelled) && <div className="status"><ErrorIcon /></div>}
            {(initial || started || finishing) && <div className="progress" style={{width: percent+"%"}}></div>}
            <Typography type="body2" className="state">
              {errored && "Error"}
              {cancelled && "Cancelled"}
            </Typography>
            {deleteEnabled && (
              <IconButton onClick={this.handleMenuOpen} className="menubtn">
                <MoreIcon />
              </IconButton>
            )}
          </div>
        </CardMedia>
        <CardContent className="content">
          <div className="text">
            <Typography type="headline" className="title" title={title}>{title}</Typography>
            <Typography type="subheading" color="secondary" className="subtitle">
              {extractor}
              {duration && (" - " + duration)}
              {audio && <span className="audio"> - audio only</span>}
            </Typography>
          </div>
        </CardContent>
        <CardActions className="controls">
          {finished && <Button dense onClick={e => this.handleDownload(e)}>Download</Button>}
          {(initial || started) && <Button dense onClick={handleCancel}>Cancel</Button>}
          {(errored || cancelled) && <Button dense onClick={handleRetry}>Restart</Button>}
        </CardActions>
        <LinearProgress mode="query" className="deleteprogress" />
        <Menu
          anchorEl={this.state.menuAnchor}
          open={this.state.menuOpen}
          onRequestClose={this.handleMenuClose}
        >
          <MenuItem onClick={this.showDropbox} disabled={!finished}>Save to Dropbox</MenuItem>
          <MenuItem onClick={this.showDrive} disabled={!finished}>Save to Google Drive</MenuItem>
          <MenuItem onClick={this.handleDelete}>Delete download</MenuItem>
        </Menu>
        {this.state.dropbox && <DropboxSaver url={public_url} filename={filename} hide={this.hideDropbox} />}
        {this.state.gdrive && <GDrive url={public_url} filename={filename} hide={this.hideDrive} />}
      </Card>
    )
  }
}
Item.propTypes = {
  // id: PropTypes.number.isRequired,
  // url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extractor: PropTypes.string.isRequired,
  duration: PropTypes.number,
  thumbnail_url: PropTypes.string,
  // progress_label: PropTypes.string,
  percent: PropTypes.number,
  audio: PropTypes.bool,
  public_url: PropTypes.string,
  filename: PropTypes.string,
  // error: PropTypes.string,  
  initial: PropTypes.bool.isRequired,
  started: PropTypes.bool.isRequired,
  errored: PropTypes.bool.isRequired,
  finished: PropTypes.bool.isRequired,
  cancelled: PropTypes.bool.isRequired,
  deleting: PropTypes.bool,
  finishing: PropTypes.bool,
  handleDelete: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleRetry: PropTypes.func.isRequired,
}

export default Item
