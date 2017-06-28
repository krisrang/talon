import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, createStyleSheet } from 'material-ui/styles'
import { grey } from 'material-ui/styles/colors'
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog'
import Slide from 'material-ui/transitions/Slide'
import IconButton from 'material-ui/IconButton'
import Typography from 'material-ui/Typography'
import HelpIcon from 'material-ui-icons/Help'
import { CircularProgress } from 'material-ui/Progress'
import Grid from 'material-ui/Grid'
import Utils from './utils'

const styleSheet = createStyleSheet('ProgressColor', () => ({
  // progress: {
  //   color: grey[50],
  // },
}));

class Extractors extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      open: false,
      extractors: []
    }

    this.openExtractors = this.openExtractors.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  openExtractors() {
    if (this.state.extractors.length == 0) {
      return this.loadExtractors()
    }

    this.open()
  }

  close() {
    this.setState({ open: false })
  }

  open() {
    this.setState({ open: true })
  }

  loadExtractors() {
    this.setState({loading: true})

    Utils.requestGet(this.props.extractorsEndpoint)
    .done((json) => {
      this.setState({extractors: json, loading: false})
      this.open()
    })
  }

  render() {
    let extractors = this.state.extractors.map((extractor, index) =>
      <Grid item sm={3} xs={12} key={index}>
        <Typography type="body2">
          {extractor}
        </Typography>
      </Grid>
    )

    return (
      <div className="extractors">
        <div className="button">
          {this.state.loading ?
            (<IconButton><CircularProgress size={22} className={this.props.classes.progress} /></IconButton>) :
            (<IconButton onClick={this.openExtractors}><HelpIcon /></IconButton>)
          }
        </div>
        <Dialog open={this.state.open} transition={Slide} onRequestClose={this.close} maxWidth="md">
          <DialogTitle>{"Supported Sites"}</DialogTitle>
          <DialogContent>
            <Grid container>
              {extractors}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.close} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}
Extractors.propTypes = {
  classes: PropTypes.object.isRequired,
  extractorsEndpoint: PropTypes.string.isRequired,
}

export default withStyles(styleSheet)(Extractors)
