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
  if (!values.password) errors.password = 'is required'
  return errors
}

function submit(values, dispatch, props) {
  return api.put(props.match.url, {password: values.password}).then(
    (result) => {
      if (result.success) {
        props.passwordResetMessage(result.message)
        props.loginFinished(result.user)
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

const resetPasswordReset = (props) => {
  props.history.push("/")
  props.passwordResetReset()
}

const ResultSlide = (props) => (
  <div className="result">
    <Typography type="body2" gutterBottom>
      {props.result.split("\n").map((l, i) => <p key={i}>{l}</p>)}
    </Typography>
    <Button raised color="primary" type="submit" onClick={() => resetPasswordReset(props)}>OK</Button>
  </div>
)
ResultSlide.propTypes = {
  result: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
}

const FormSlide = (props) => (
  <form action="nowhere" onSubmit={props.handleSubmit}>
    {props.error && (
      <Typography type="subheading" gutterBottom className="formerror">
        {props.error}
      </Typography>
    )}
    <fieldset>
      <Field name="password" label="Password" type="password" component={AuthField} />
    </fieldset>
    <div className="controls">
      <Button raised color="primary" type="submit" disabled={props.submitting}>Continue</Button>
      {!props.submitting && (
        <div className="suggestion">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      )}
    </div>
  </form>
)
FormSlide.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

let PasswordResetForm = (props) => (
  <AuthModal id="password_reset" title="Reset password">
    <div className="authslide-wrapper">
      <CSSTransitionGroup
        transitionName="authcard"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {props.passwordResetResult ? 
          (<ResultSlide key="passwordResetResult" result={props.passwordResetResult} passwordResetReset={props.passwordResetReset} history={props.history} />) :
          (<FormSlide key="passwordResetForm" {...props} />)
        }
      </CSSTransitionGroup>
    </div>
    {props.submitting && <LinearProgress className="progressbar" />}
  </AuthModal>
)
PasswordResetForm.propTypes = {
  history: PropTypes.object.isRequired,
  passwordResetReset: PropTypes.func.isRequired,
  passwordResetResult: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
}

PasswordResetForm = reduxForm({
  form: 'passwordReset',
  onSubmit: submit,
  validate
})(PasswordResetForm)

const mapStateToProps = (state) => ({
  endpoints: state.endpoints,
  passwordResetResult: state.passwordResetResult
})

export default connect(mapStateToProps, ActionTypes)(PasswordResetForm)
