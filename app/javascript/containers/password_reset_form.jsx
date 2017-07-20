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

let PasswordResetForm = (props) => (
  <AuthModal
    id="password_reset"
    title="Reset password"
    resultMessage={props.passwordResetResult}
    {...props}>
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
  </AuthModal>
)
PasswordResetForm.propTypes = {
  error: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
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
