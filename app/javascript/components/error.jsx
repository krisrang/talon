import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import Slide from 'material-ui/transitions/Slide'
import * as ActionTypes from '../actions'

const Error = ({open, message, errorHide}) => {
  return (
    <Dialog id="errormodal" open={open} transition={Slide} onRequestClose={errorHide}>
      <DialogTitle>{"Error"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={errorHide} color="accent">Close</Button>
      </DialogActions>
    </Dialog>
  )
}

Error.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string,
  errorHide: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  ...state.error
})

export default connect(mapStateToProps, ActionTypes)(Error)
