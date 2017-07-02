import * as ActionTypes from '../actions'
import { combineReducers } from 'redux'

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

function addDownload(state, download) {
  let newState = state.slice()
  newState.push(download)
  return newState;
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
    case ActionTypes.SEARCH_SUCCESS:
      return addDownload(state, action.download)
    case ActionTypes.DOWNLOAD_STARTING:
      return updateDownload(state, action.id, {
        cancelled: false,
        initial: false,
        starting: true,
        started: true,
        progress_label: "Waiting for download to start..."
      })
    case ActionTypes.DOWNLOAD_STARTED:
      return updateDownload(state, action.id, {starting: false})
    case ActionTypes.DOWNLOAD_LOGS_TOGGLE:
      return updateDownload(state, action.id, {
        logsExpanded: !state.find((d) => d.id === action.id).logsExpanded
      })
    case ActionTypes.DOWNLOAD_COPY_TOGGLE:
      return updateDownload(state, action.id, {
        copyActive: !state.find((d) => d.id === action.id).copyActive
      })
    case ActionTypes.DOWNLOAD_CHANGED:
       return updateDownload(state, action.id, action.changes)
    case ActionTypes.DOWNLOAD_CANCELLED:
      return updateDownload(state, action.id, {
        cancelled: true,
        percent: 0,
        log: null,
        logsExpanded: false,
        started: false
      })
    case ActionTypes.DOWNLOAD_FINISHED:
      return updateDownload(state, action.id, {
        public_url: action.url,
        logsExpanded: false,
        finished: true,
        started: false
      })
    case ActionTypes.DOWNLOAD_ERRORED:
      return updateDownload(state, action.id, {
        initial: false,
        starting: false,
        started: false,
        errored: true,
        public_url: "",
        logsExpanded: true,
        log: action.error
      })
    case ActionTypes.DOWNLOAD_DELETED:
      return removeDownload(state, action.id)
    default:
      return state
  }
}

const scrollStatus = (state = null, action) => {
  switch(action.type) {
    case ActionTypes.WINDOW_SCROLL:
      return {scrolled: action.offset > 0}
    default:
      return {scrolled: false}
  }
}

const endpoints = (state = {}) => (state)

const rootReducer = combineReducers({
  error,
  search,
  downloads,
  scrollStatus,
  endpoints
})

export default rootReducer