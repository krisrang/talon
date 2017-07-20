import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'
import Paper from 'material-ui/Paper'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import { LinearProgress } from 'material-ui/Progress'
import logo from '../../assets/images/logo.png'
import logo2x from '../../assets/images/logo@2x.png'

const resetAuth = (props) => {
  props.history.push("/")
  props.loginReset()
  props.registerReset()
  props.passwordResetReset()
}

const ResultSlide = (props) => (
  <div className="result">
    <Typography type="body2" gutterBottom>
      {props.result.split("\n").map((l, i) => <p key={i}>{l}</p>)}
    </Typography>
    <Button raised color="primary" type="submit" onClick={() => resetAuth(props)}>OK</Button>
  </div>
)
ResultSlide.propTypes = {
  result: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  loginReset: PropTypes.func.isRequired,
  registerReset: PropTypes.func.isRequired,
  passwordResetReset: PropTypes.func.isRequired,
}

const AuthModal = (props) => {
  const { children, title, id, submitting, resultMessage } = props
  const logoSrc = logo + " 1x, " + logo2x + " 2x"

  return (
    <div>
      <div className="background-container">
        <div className="noise"></div>
      </div>
      <Paper id={id} className="authcard">
        <Link to="/">
          <img className="logo" src={logo} srcSet={logoSrc} />
        </Link>
        <Typography type="display1" gutterBottom>
          {title}
        </Typography>
        <div className="authslide-wrapper">
          <TransitionGroup>
            <CSSTransition key={resultMessage ? "authResult" : "authForm"} classNames="authcard" timeout={500}>
              {resultMessage ? 
                (<ResultSlide result={resultMessage} {...props} />) :
                (children)}
            </CSSTransition>
          </TransitionGroup>
        </div>
        {submitting && <LinearProgress className="progressbar" />}
      </Paper>
    </div>
  )
}
AuthModal.propTypes = {
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  resultMessage: PropTypes.string,
  loginReset: PropTypes.func.isRequired,
  registerReset: PropTypes.func.isRequired,
  passwordResetReset: PropTypes.func.isRequired,
}

export default AuthModal
