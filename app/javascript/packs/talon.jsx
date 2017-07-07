import Raven from 'raven-js'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { MuiThemeProvider } from 'material-ui/styles'

import configureStore from '../store/configureStore'
import theme from '../components/themes'
import App from '../containers/app'
import Authmodal from '../containers/auth_modal'
import '../styles'

if (process.env.NODE_ENV === "production") {
  Raven.config('https://ea53cac4219a4e56bc615fc0871777e4@sentry.io/180841').install()
}

const node = document.getElementById('talon')
const data = JSON.parse(node.getAttribute('data'))
const cable = window.TalonCable && window.TalonCable.cable
const store = configureStore({
  endpoints: data.endpoints,
  downloads: data.downloads,
  registerResult: data.register_result,
  passwordResetResult: data.password_reset_result,
  currentUser: data.current_user,
})

const Root = (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <div>
          <Route exact path="/" render={() => <App cable={cable} />} />
          <Route path="/login" component={Authmodal} />
          <Route path="/register" component={Authmodal} />
          <Route path="/users/activate/:token" component={Authmodal} />
          <Route path="/users/password-reset/:token" component={Authmodal} />
        </div>
      </BrowserRouter>
    </MuiThemeProvider>
  </Provider>
)

render(Root, node)
