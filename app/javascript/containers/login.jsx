import React from 'react'
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import Slide from 'material-ui/transitions/Slide'

const Login = () => {
  return (
    <Dialog open={true} transition={Slide}>
      <DialogTitle>{"Login"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"hi!"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="accent">Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default Login
