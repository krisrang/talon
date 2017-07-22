import React from 'react'
import PropTypes from 'prop-types'
import Raven from 'raven-js'
import Button from 'material-ui/Button'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withResponsiveFullScreen
} from 'material-ui/Dialog'
import { LinearProgress } from 'material-ui/Progress'

const ResponsiveDialog = withResponsiveFullScreen({breakpoint: 'xs'})(Dialog)

class DropboxSaver extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      percent: 0,
      success: false,
    }
  }

  componentDidMount() {
    const {
      url,
      filename,
      hide
    } = this.props

    if (!window.Dropbox) {
      this.setState({error: "Error, Dropbox API not loaded!"})
      return
    }

    window.Dropbox.save(url, filename, {
      success: () => this.setState({success: true}),
      progress: (percent) => this.setState({percent}),
      cancel: () => hide(),
      error: (error) => this.error(error)
    })
  }

  error(error) {
    this.setState({error})

    if (!Raven.isSetup()) {
      return
    }

    Raven.captureMessage('Dropbox save failed', {
      extra: {
        message: error,
        url: this.props.url,
        filename: this.props.filename,
      }
    })
  }

  render() {
    const { error, percent, success } = this.state
    const inProgress = !error && !success
    const progressMode = percent > 0 ? "determinate" : "query"

    return (
      <ResponsiveDialog id="dropboxmodal" open={true} ignoreBackdropClick={true} onRequestClose={this.props.hide}>
        <DialogTitle>{"Saving to Dropbox"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {error && `Error: ${error}`}
            {success && "Success!"}
          </DialogContentText>
          {inProgress && <LinearProgress mode={progressMode} value={percent} />}
        </DialogContent>
        {!inProgress && <DialogActions><Button onClick={this.props.hide} color="accent">Close</Button></DialogActions>}
      </ResponsiveDialog>
    )
  }
}
DropboxSaver.propTypes = {
  open: PropTypes.bool,
  url: PropTypes.string,
  filename: PropTypes.string,
  hide: PropTypes.func.isRequired,
}

export default DropboxSaver
