import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Field, reduxForm, SubmissionError } from 'redux-form'
import { CSSTransitionGroup } from 'react-transition-group'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import { LinearProgress } from 'material-ui/Progress'
import * as ActionTypes from '../actions'
import api from '../api'
import AuthModal from './auth_modal'
import AuthField from './auth_field'

const validate = (values) => {
  const errors = {}

  if (!values.email) errors.email = 'is required'
  if (!values.password) errors.password = 'is required'

  if (Object.keys(errors).length > 0) throw new SubmissionError(errors)
}

function submit(values, dispatch, props) {
  validate(values)

  const { email, password } = values

  return api.post(props.endpoints.sessions, {email, password}).then(
    (result) => {
      if (result.user) {
        props.loginFinished(result.user, result.downloads)
        props.history.push("/")
      }
    },
    (result) => {
      if (result.errors) {
        throw new SubmissionError(result.errors)
      } else {
        throw new SubmissionError({_error: result})
      }
    }
  )
}

function submitForgotPassword(values, dispatch, props) {
  if (!values.email) throw new SubmissionError({email: 'is required'})

  return api.post(props.endpoints.forgot_password, {email: values.email}).then(
    (result) => { if (result.ok) props.loginMessage(result.message) },
    (result) => { throw new SubmissionError({_error: result}) }
  )
}

const resetLogin = (props) => {
  props.history.push("/")
  props.loginReset()
}

const ResultSlide = (props) => (
  <div className="result">
    <Typography type="body2" gutterBottom>
      {props.result.split("\n").map((l, i) => <p key={i}>{l}</p>)}
    </Typography>
    <Button raised color="primary" type="submit" onClick={() => resetLogin(props)}>OK</Button>
  </div>
)
ResultSlide.propTypes = {
  result: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
}

const FormSlide = (props) => (
  <form action="nowhere" onSubmit={props.handleSubmit(submit)}>
    {props.error && (
      <Typography type="subheading" gutterBottom className="formerror">
        {props.error}
      </Typography>
    )}
    <fieldset>
      <Field name="email" label="Email" type="email" component={AuthField} />
      <Field name="password" label="Password" type="password" component={AuthField} />
      <div className="forgotpw">
        {props.submitting ?
          (<a>&nbsp;</a>) :
          (<a onClick={props.handleSubmit(submitForgotPassword)}>Forgot your password?</a>)
        }
      </div>
    </fieldset>
    <div className="controls">
      <Button raised color="primary" type="submit" disabled={props.submitting}>Login</Button>
      <div className="suggestion">
        {!props.submitting && (
          <span>
            Need an account? <Link to="/register">Register</Link>
          </span>
        )}
      </div>
    </div>
  </form>
)
FormSlide.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

let LoginForm = (props) => (
  <AuthModal id="login" title="Hi there.">
    <div className="authslide-wrapper">
      <CSSTransitionGroup
        transitionName="authcard"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {props.loginResult ? 
          (<ResultSlide key="loginResult" result={props.loginResult} loginReset={props.loginReset} history={props.history} />) :
          (<FormSlide key="loginForm" {...props} />)
        }
      </CSSTransitionGroup>
    </div>
    {props.submitting && <LinearProgress className="progressbar" />}
  </AuthModal>
)
LoginForm.propTypes = {
  history: PropTypes.object.isRequired,
  loginFinished: PropTypes.func.isRequired,
  loginReset: PropTypes.func.isRequired,
  loginResult: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
}

LoginForm = reduxForm({
  form: 'login',
  // onSubmit: submit,
  // validate
})(LoginForm)

const mapStateToProps = (state) => ({
  endpoints: state.endpoints,
  loginResult: state.loginResult
})

export default connect(mapStateToProps, ActionTypes)(LoginForm)
