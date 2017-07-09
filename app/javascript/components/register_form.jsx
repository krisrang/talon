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

const resetRegister = (props) => {
  props.history.push("/")
  props.registerReset()
}

const ResultSlide = (props) => (
  <div className="result">
    <Typography type="body2" gutterBottom>
      {props.result.split("\n").map((l, i) => <p key={i}>{l}</p>)}
    </Typography>
    <Button raised color="primary" type="submit" onClick={() => resetRegister(props)}>OK</Button>
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
)
FormSlide.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

let RegisterForm = (props) => (
  <AuthModal id="register" title="Create an account">
    <div className="authslide-wrapper">
      <CSSTransitionGroup
        transitionName="authcard"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {props.registerResult ? 
          (<ResultSlide key="registerResult" result={props.registerResult} registerReset={props.registerReset} history={props.history} />) :
          (<FormSlide key="registerForm" {...props} />)
        }
      </CSSTransitionGroup>
    </div>
    {props.submitting && <LinearProgress className="progressbar" />}
  </AuthModal>
)
RegisterForm.propTypes = {
  history: PropTypes.object.isRequired,
  registerReset: PropTypes.func.isRequired,
  registerResult: PropTypes.string,
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
