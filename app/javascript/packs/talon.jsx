import Raven from 'raven-js'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { MuiThemeProvider } from 'material-ui/styles'

import configureStore from '../store/configureStore'
import theme from '../themes'
import Error from '../containers/error'
import App from '../containers/app'
import LoginForm from '../containers/login_form'
import RegisterForm from '../containers/register_form'
import PasswordResetForm from '../containers/password_reset_form'
import messengerSubscribe from '../store/messenger'
import '../styles'

if (process.env.NODE_ENV === "production") {
  Raven.config('https://ea53cac4219a4e56bc615fc0871777e4@sentry.io/180841').install()
}

const node = document.getElementById('talon')
const data = JSON.parse(node.getAttribute('data'))
const store = configureStore({
  endpoints: data.endpoints,
  downloads: data.downloads,
  registerResult: data.register_result,
  passwordResetResult: data.password_reset_result,
  user: data.current_user,
})

messengerSubscribe("/downloads", store)

const Root = (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <div>
          <Error />
          <Route exact path="/" component={App} />
          <Route path="/login" component={LoginForm} />
          <Route path="/register" component={RegisterForm} />
          <Route path="/users/activate/:token" component={RegisterForm} />
          <Route path="/users/password-reset/:token" component={PasswordResetForm} />
        </div>
      </BrowserRouter>
    </MuiThemeProvider>
  </Provider>
)

render(Root, node)
