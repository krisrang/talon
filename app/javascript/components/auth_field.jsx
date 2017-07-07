import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import TextField from 'material-ui/TextField'

const AuthField = (props) => {
  const { meta, input } = props
  const errored = meta.touched && meta.error
  const errorText = meta.touched && meta.error ? meta.error : null

  const label = (
    <span className="label">
      {props.label}
      {errorText && <span className="label-error"> {errorText}</span>}
    </span>
  )

  return (
    <div className={classNames('field', {'error': errored, 'submitting': meta.submitting})}>
      <TextField
        fullWidth
        error={!!errored}
        disabled={meta.submitting}
        name={input.name}
        label={label}
        type={props.type}
        onBlur={input.onBlur}
        onFocus={input.onFocus}
        onChange={input.onChange} />
    </div>
  )
}
AuthField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  input: PropTypes.object.isRequired,
}

export default AuthField
