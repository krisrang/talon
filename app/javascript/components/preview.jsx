import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'
import { LinearProgress } from 'material-ui/Progress'
import Button from 'material-ui/Button'
import Input from 'material-ui/Input'
import Typography from 'material-ui/Typography'
import Switch from 'material-ui/Switch'
import Paper from 'material-ui/Paper'
import * as ActionTypes from '../actions'
import Utils from '../utils'

class PreviewItem extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      audio: null,
      email: props.email || "",
      emailEnabled: null,
    }

    this.toggleAudio = this.toggleAudio.bind(this)
    this.toggleEmail = this.toggleEmail.bind(this)
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.addDownload = this.addDownload.bind(this)
  }

  toggleAudio() {
    this.setState({audio: !this.state.audio})
  }

  toggleEmail() {
    this.setState({emailEnabled: !this.state.emailEnabled})
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value})
  }

  addDownload() {
    const email = this.state.emailEnabled ? this.state.email : null
    this.props.downloadAdd(this.props.url, this.state.audio, email)
  }

  render() {
    const { extractor, title, previewReset, thumbnail_url, adding } = this.props
    const duration = Utils.durationHuman(this.props.duration)

    return (
      <div id="preview" className={classNames({adding})}>
        <div className="backdrop" onClick={previewReset}></div>
        <Paper className="dialog" elevation={3}>
          <div className="contents">
            <div className="cover">
              <div className="thumbnail" style={{backgroundImage: "url("+thumbnail_url+")"}} />
            </div>
            <Typography type="title" className="title">
              {title}
            </Typography>
            <Typography type="caption" className="subtitle">
              {extractor}
              {duration && (" - " + duration)}
            </Typography>
            <div className="options">
              <label htmlFor="audio">
                <span className="label" onClick={this.toggleAudio}>Audio only</span>
                <Switch id="audio" checked={this.state.audio} onChange={this.toggleAudio}/>
              </label>
              <label htmlFor="emailswitch">
                <span className="label" onClick={this.toggleEmail}>Email when complete</span>
                <Switch id="emailswitch" checked={this.state.emailEnabled} onChange={this.toggleEmail}/>
                {this.state.emailEnabled && (
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    className="emailinput"
                    value={this.state.email}
                    onChange={this.handleEmailChange} />
                )}
              </label>
            </div>
            <div className="controls">
              <Button onClick={previewReset}>Cancel</Button>
              <Button onClick={this.addDownload} color="primary" raised>Start</Button>
            </div>
          </div>
          <LinearProgress mode="query" className="addingprogress" />
        </Paper>
      </div>
    )
  }
}
PreviewItem.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  extractor: PropTypes.string.isRequired,
  thumbnail_url: PropTypes.string.isRequired,
  duration: PropTypes.number,
  email: PropTypes.string,
  adding: PropTypes.bool,
  previewReset: PropTypes.func.isRequired,
  downloadAdd: PropTypes.func.isRequired,
}

const Preview = (props) => (
  <TransitionGroup>
    {props.urlkey ? (
      <CSSTransition key={props.urlkey} classNames={props.adding ? "addeditem" : "previewitem"} timeout={500}>
        <PreviewItem {...props} />
      </CSSTransition>
    ) : null}
  </TransitionGroup>
)
Preview.propTypes = {
  urlkey: PropTypes.string,
  adding: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  ...state.preview,
  email: state.user && state.user.email,
})

export default connect(mapStateToProps, ActionTypes)(Preview)
