import React from 'react'
import PropTypes from 'prop-types'
import Button from 'material-ui/Button'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
  withResponsiveFullScreen
} from 'material-ui/Dialog'

const ResponsiveDialog = withResponsiveFullScreen({breakpoint: 'xs'})(Dialog)

class GDrive extends React.PureComponent {
  renderDrive() {
    window.gapi.savetodrive.go('gdrivebtn')
  }

  render() {
    return (
      <ResponsiveDialog open={true} ignoreBackdropClick={true} onEntered={this.renderDrive} onRequestClose={this.props.hide}>
        <DialogTitle>{"Saving to Google Drive"}</DialogTitle>
        <DialogContent>
          <p>Click the button to save file to Google Drive:</p>
          <div id="gdrivebtn">
            <div className="g-savetodrive"
              data-src={this.props.url}
              data-filename={this.props.filename}
              data-sitename="Talon">
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.hide} color="accent">Close</Button>
        </DialogActions>
      </ResponsiveDialog>
    )
  }
}
GDrive.propTypes = {
  open: PropTypes.bool,
  url: PropTypes.string,
  filename: PropTypes.string,
  hide: PropTypes.func.isRequired,
}

export default GDrive
