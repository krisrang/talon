import api from '../api'

export const ERROR_SHOW = 'ERROR_SHOW'
export const ERROR_HIDE = 'ERROR_HIDE'

export const errorShow = (message) => ({
  type: ERROR_SHOW,
  message
})

export const errorHide = () => ({
  type: ERROR_HIDE
})

export const SEARCH_INPUT = 'SEARCH_INPUT'
export const SEARCH_FETCHING = 'SEARCH_FETCHING'
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS'
export const SEARCH_ERROR = 'SEARCH_ERROR'
export const SEARCH_RESET = 'SEARCH_RESET'

export const searchReset = () => ({
  type: SEARCH_RESET
})

export const searchInput = (url) => ({
  type: SEARCH_INPUT,
  url
})

export const searchSuccess = (download) => ({
  type: SEARCH_SUCCESS,
  download
})

export const searchError = (message) => ({
  type: SEARCH_ERROR,
  message
})

export const searchStart = (endpoint, url) => (
  function (dispatch) {
    dispatch({type: SEARCH_FETCHING})

    return api.post(endpoint, {url}).then(
      download => dispatch(searchSuccess(download)),
      error => dispatch(searchError(error))
    )
  }
)

export const WINDOW_SCROLL = 'WINDOW_SCROLL'

export const windowScroll = (offset) => ({
  type: WINDOW_SCROLL,
  offset
})

export const listenScroll = () => (
  function (dispatch) {
    const handleEvent = () => { dispatch(windowScroll(window.pageYOffset)) }

    window.addEventListener('scroll', handleEvent)
    return () => window.removeEventListener('scroll', handleEvent)
  }
)

export const DOWNLOAD_STARTING = 'DOWNLOAD_STARTING'
export const DOWNLOAD_STARTED = 'DOWNLOAD_STARTED'
export const DOWNLOAD_CANCELLED = 'DOWNLOAD_CANCELLED'
export const DOWNLOAD_CHANGED = 'DOWNLOAD_CHANGED'
export const DOWNLOAD_ERRORED = 'DOWNLOAD_ERRORED'
export const DOWNLOAD_LOGS_TOGGLE = 'DOWNLOAD_LOGS_TOGGLE'
export const DOWNLOAD_COPY_TOGGLE = 'DOWNLOAD_COPY_TOGGLE'
export const DOWNLOAD_DELETED = 'DOWNLOAD_DELETED'
export const DOWNLOAD_FINISHED = 'DOWNLOAD_FINISHED'

export const downloadStarting = (id) => ({
  type: DOWNLOAD_STARTING,
  id
})

export const downloadStarted = (id) => ({
  type: DOWNLOAD_STARTED,
  id
})

export const downloadChanged = (id, changes) => ({
  type: DOWNLOAD_CHANGED,
  id,
  changes
})

export const downloadCancelled = (id) => ({
  type: DOWNLOAD_CANCELLED,
  id
})

export const downloadErrored = (id, error) => ({
  type: DOWNLOAD_ERRORED,
  id,
  error
})

export const downloadLogsToggle = (id) => ({
  type: DOWNLOAD_LOGS_TOGGLE,
  id
})

export const downloadCopyToggle = (id) => ({
  type: DOWNLOAD_COPY_TOGGLE,
  id
})

export const downloadDeleted = (id) => ({
  type: DOWNLOAD_DELETED,
  id
})

export const downloadFinished = (id, url) => ({
  type: DOWNLOAD_FINISHED,
  id,
  url
})

export const downloadStart = (endpoint, id) => (
  function (dispatch) {
    dispatch(downloadStarting(id))

    return api.post(endpoint).then(
      () => dispatch(downloadStarted(id)),
      error => dispatch(downloadErrored(id, error))
    )
  }
)

export const downloadDelete = (endpoint, id) => (
  function (dispatch) {
    return api.delete(endpoint).then(
      () => dispatch(downloadDeleted(id)),
      error => dispatch(errorShow(error))
    )
  }
)
