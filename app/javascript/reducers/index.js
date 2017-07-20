import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import * as ActionTypes from '../actions'

const error = (state = {}, action) => {
  switch(action.type) {
    case ActionTypes.SEARCH_ERROR:
    case ActionTypes.ERROR_SHOW:
      return {open: true, message: action.message}
    default:
      return {...state, open: false}
  }
}

const search = (state = {}, action) => {
  switch(action.type) {
    case ActionTypes.SEARCH_INPUT:
      return {
        ...state,
        url: action.url
      }
    case ActionTypes.SEARCH_FETCHING:
      return {
        ...state,
        loading: true
      }
    case ActionTypes.SEARCH_SUCCESS:
    case ActionTypes.SEARCH_ERROR:
    case ActionTypes.SEARCH_RESET:
      return {
        ...state,
        url: "",
        loading: false
      }
    default:
      return {
        ...state,
        url: state.url || ""
      }
  }
}

const preview = (state = {}, action) => {
  switch(action.type) {
    case ActionTypes.SEARCH_SUCCESS:
      return {
        ...action.download,
        adding: false,
        error: null,
      }
    case ActionTypes.PREVIEW_ADDING:
      return {
        ...state,
        adding: true,
      }
    case ActionTypes.PREVIEW_ERRORED:
    return {
      ...state,
      adding: false,
      error: action.error,
    }
    case ActionTypes.DOWNLOAD_ADDED:
      return { adding: true }
    case ActionTypes.PREVIEW_RESET:
      return { adding: false, error: null }
    default:
      return state
  }
}

function addDownload(state, download) {
  return [
    download,
    ...state
  ]
}

function removeDownload(state, id) {
  return state.filter( (d) => d.id !== id)
}

function updateDownload(state, id, changes) {
  return state.map((d) => {
      if (d.id !== id) {
        return d
      }

      return {
        ...d,
        ...changes
      } 
  })
}

const downloads = (state = [], action) => {
  switch(action.type) {
    case ActionTypes.DOWNLOAD_ADDED:
      return addDownload(state, action.download)
    case ActionTypes.DOWNLOAD_STARTING:
      return updateDownload(state, action.id, {
        cancelled: false,
        initial: true,
        started: false,
        errored: false,
        finishing: false,
        deleting: false,
        progress_label: null,
        percent: 0,
      })
    case ActionTypes.DOWNLOAD_PROGRESS:
       return updateDownload(state, action.id, {
         percent: action.percent,
         progress_label: action.progress_label,
         initial: false,
         started: true,
       })
    case ActionTypes.DOWNLOAD_CANCELLED:
      return updateDownload(state, action.id, {
        initial: false,
        started: false,
        cancelled: true,
        percent: 0,
      })
    case ActionTypes.DOWNLOAD_FINISHED:
      return updateDownload(state, action.id, {
        public_url: action.url,
        finishing: true,
        finished: true,
        started: false
      })
    case ActionTypes.DOWNLOAD_ERRORED:
      return updateDownload(state, action.id, {
        initial: false,
        starting: false,
        started: false,
        deleting: false,
        errored: true,
        public_url: "",
        error: action.error
      })
    case ActionTypes.DOWNLOAD_DELETING:
      return updateDownload(state, action.id, {
        deleting: true
      })
    case ActionTypes.DOWNLOAD_DELETED:
      return removeDownload(state, action.id)
    case ActionTypes.LOGIN_FINISHED:
      return action.downloads
    case ActionTypes.USER_LOGGEDOUT:
      return []
    default:
      return state
  }
}

const scrollStatus = (state, action) => {
  switch(action.type) {
    case ActionTypes.WINDOW_SCROLL:
      return {scrolled: action.offset > 0}
    default:
      return {scrolled: false}
  }
}

const registerResult = (state = null, action) => {
  switch(action.type) {
    case ActionTypes.REGISTER_MESSAGE:
      return action.message
    case ActionTypes.REGISTER_RESET:
      return null
    default:
      return state
  }
}

const loginResult = (state = null, action) => {
  switch(action.type) {
    case ActionTypes.LOGIN_MESSAGE:
      return action.message
    case ActionTypes.LOGIN_RESET:
    case ActionTypes.LOGIN_FINISHED:
      return null
    default:
      return state
  }
}

const passwordResetResult = (state = null, action) => {
  switch(action.type) {
    case ActionTypes.PASSWORD_RESET_MESSAGE:
      return action.message
    case ActionTypes.PASSWORD_RESET_RESET:
      return null
    default:
      return state
  }
}

const user = (state = {}, action) => {
  switch(action.type) {
    case ActionTypes.LOGIN_FINISHED:
      return action.user
    case ActionTypes.USER_LOGGEDOUT:
      return {}
    default:
      return state
  }
}
const endpoints = (state = {}) => (state)

const rootReducer = combineReducers({
  error,
  search,
  preview,
  downloads,
  scrollStatus,
  endpoints,
  registerResult,
  loginResult,
  passwordResetResult,
  user,
  form: formReducer
})

export default rootReducer
