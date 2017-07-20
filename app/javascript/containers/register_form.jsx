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

  return errors
}

function submit(values, dispatch, props) {
  const { email, password } = values

  return api.post(props.endpoints.users, {email, password}).then(
    (result) => {
      if (result.success) {
        props.registerMessage(result.message)
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

let RegisterForm = (props) => (
  <AuthModal
    id="register"
    title="Create an account"
    resultMessage={props.registerResult}
    {...props}>
    <form action="nowhere" onSubmit={props.handleSubmit}>
      {props.error && (
        <Typography type="subheading" gutterBottom className="formerror">
          {props.error}
        </Typography>
      )}
      <fieldset>
        <Field name="email" label="Email" type="email" component={AuthField} />
        <Field name="password" label="Password" type="password" component={AuthField} />
      </fieldset>
      <div className="controls">
        <Button raised color="primary" type="submit" disabled={props.submitting}>Continue</Button>
        <div className="suggestion">
          {!props.submitting && (
            <span>
              Already have an account? <Link to="/login">Login</Link>
            </span>
          )}
        </div>
      </div>
    </form>
  </AuthModal>
)
RegisterForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  registerResult: PropTypes.string,
  error: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
}

RegisterForm = reduxForm({
  form: 'register',
  onSubmit: submit,
  validate
})(RegisterForm)

const mapStateToProps = (state) => ({
  endpoints: state.endpoints,
  registerResult: state.registerResult
})

export default connect(mapStateToProps, ActionTypes)(RegisterForm)
