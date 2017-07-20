import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import Raven from 'raven-js'
import createRavenMiddleware from 'raven-for-redux'
import rootReducer from '../reducers'

const configureStore = preloadedState => {
  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunk, createRavenMiddleware(Raven))
  )

  return store
}

export default configureStore
