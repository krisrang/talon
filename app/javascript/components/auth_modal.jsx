import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import Typography from 'material-ui/Typography'
import logo from '../../assets/images/logo.png'
import logo2x from '../../assets/images/logo@2x.png'

const AuthModal = ({children, title, id}) => {
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
        {children}
      </Paper>
    </div>
  )
}
AuthModal.propTypes = {
  children: PropTypes.array,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default AuthModal
