import Raven from 'raven-js'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import createPalette from 'material-ui/styles/palette'
import { deepOrange, lightBlue, grey } from 'material-ui/styles/colors'
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import Slide from 'material-ui/transitions/Slide'
import DownloadStore from '../talon/download_store'
import Downloader from '../talon/downloader'
import List from '../talon/list'
import '../styles'

const theme = createMuiTheme({
  palette: createPalette({
    // type: 'dark',
    primary: lightBlue,
    accent: deepOrange
  }),
  overrides: {
    MuiDialogContent: {
      root: {
        "-webkit-overflow-scrolling": "touch"
      }
    }
  }
})

class Talon extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      errorOpen: false,
      error: ""
    }

    this.consumer = ActionCable.createConsumer()

    this.error = this.error.bind(this)
    this.closeError = this.closeError.bind(this)
    this.addVideo = this.addVideo.bind(this)
  }

  error(message) {
    this.setState({ errorOpen: true, error: message })
  }

  closeError() {
    this.setState({ errorOpen: false, error: "" })
  }

  addVideo(info) {
    this.props.store.add(info)
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Downloader showError={this.error} addVideo={this.addVideo} {...this.props} />
          <List showError={this.error} consumer={this.consumer} {...this.props} />
          <Dialog open={this.state.errorOpen} transition={Slide} onRequestClose={this.closeError}>
            <DialogTitle>{"Error"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {this.state.error}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeError} color="accent">Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    )
  }
}
Talon.propTypes = {
  store: PropTypes.object.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
  extractorsEndpoint: PropTypes.string.isRequired,
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('talon')
  const data = JSON.parse(node.getAttribute('data'))
  data.store = new DownloadStore(data.downloads)

  if (data.env === "production") {
    Raven.config('https://ea53cac4219a4e56bc615fc0871777e4@sentry.io/180841').install()
  }

  ReactDOM.render(<Talon {...data} />, node)
})
