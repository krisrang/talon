import React from 'react'
import { Link, Route } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import LoginForm from '../components/login_form'
import RegisterForm from '../components/register_form'
import PasswordResetForm from '../components/password_reset_form'
import logo from '../../assets/images/logo.png'
import logo2x from '../../assets/images/logo@2x.png'

const AuthModal = () => {
  const logoSrc = logo + " 1x, " + logo2x + " 2x"

  return (
    <div>
      <div className="background-container">
        <div className="noise"></div>
      </div>
      <Paper id="login" className="authcard">
        <Link to="/">
          <img className="logo" src={logo} srcSet={logoSrc} />
        </Link>
        <Route path="/login" component={LoginForm} />
        <Route path="/register" component={RegisterForm} />
        <Route path="/users/activate/:token" component={RegisterForm} />
        <Route path="/users/password-reset/:token" component={PasswordResetForm} />
      </Paper>
    </div>
  )
}

export default AuthModal
