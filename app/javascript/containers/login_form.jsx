import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Field, reduxForm, SubmissionError } from 'redux-form'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import * as ActionTypes from '../actions'
import api from '../api'
import AuthModal from '../components/auth_modal'
import AuthField from '../components/auth_field'

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

let LoginForm = (props) => (
  <AuthModal
    id="login"
    title="Hi there."
    resultMessage={props.loginResult}
    {...props}>
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
  </AuthModal>
)
LoginForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  loginResult: PropTypes.string,
  error: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
}

LoginForm = reduxForm({
  form: 'login',
})(LoginForm)

const mapStateToProps = (state) => ({
  endpoints: state.endpoints,
  loginResult: state.loginResult
})

export default connect(mapStateToProps, ActionTypes)(LoginForm)
