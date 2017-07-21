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

export const searchStart = (url) => (
  function (dispatch, getState) {
    const { endpoints } = getState()
    dispatch({type: SEARCH_FETCHING})

    return api.post(endpoints.download_info, {url}).then(
      download => dispatch(searchSuccess(download)),
      error => dispatch(searchError(error))
    )
  }
)

export const PREVIEW_ADDING = 'PREVIEW_ADDING'
export const PREVIEW_ERRORED = 'PREVIEW_ERRORED'
export const PREVIEW_RESET = 'PREVIEW_RESET'

export const previewAdding = () => ({
  type: PREVIEW_ADDING
})

export const previewErrored = (error) => ({
  type: PREVIEW_ERRORED,
  error
})

export const previewReset = () => ({
  type: PREVIEW_RESET
})

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

export const DOWNLOAD_ADDED = 'DOWNLOAD_ADDED'
export const DOWNLOAD_STARTING = 'DOWNLOAD_STARTING'
export const DOWNLOAD_STARTED = 'DOWNLOAD_STARTED'
export const DOWNLOAD_ERRORED = 'DOWNLOAD_ERRORED'
export const DOWNLOAD_DELETING = 'DOWNLOAD_DELETING'
export const DOWNLOAD_DELETED = 'DOWNLOAD_DELETED'

export const downloadAdded = (download) => ({
  type: DOWNLOAD_ADDED,
  download
})

export const downloadStarting = (id) => ({
  type: DOWNLOAD_STARTING,
  id
})

export const downloadStarted = (id) => ({
  type: DOWNLOAD_STARTED,
  id
})

export const downloadErrored = (id, error) => ({
  type: DOWNLOAD_ERRORED,
  id,
  error
})

export const downloadDeleting = (id) => ({
  type: DOWNLOAD_DELETING,
  id
})

export const downloadDeleted = (id) => ({
  type: DOWNLOAD_DELETED,
  id
})

export const downloadAdd = (url, audio, email) => (
  function (dispatch, getState) {
    const { endpoints } = getState()
    dispatch(previewAdding())

    return api.post(endpoints.downloads, {url, audio, email}).then(
      download => dispatch(downloadAdded(download)),
      error => dispatch(previewErrored(error))
    )
  }
)

export const downloadStart = (id) => (
  function (dispatch, getState) {
    const { endpoints } = getState()
    dispatch(downloadStarting(id))

    return api.post(endpoints.downloads + "/" + id + "/start").then(
      () => dispatch(downloadStarting(id)),
      error => dispatch(downloadErrored(id, error))
    )
  }
)

export const downloadCancel = (id) => (
  function (dispatch, getState) {
    const { endpoints } = getState()
    return api.post(endpoints.downloads + "/" + id + "/cancel")
  }
)

export const downloadDelete = (id) => (
  function (dispatch, getState) {
    const { endpoints } = getState()
    dispatch(downloadDeleting(id))

    return api.delete(endpoints.downloads + "/" + id).then(
      () => dispatch(downloadDeleted(id)),
      error => dispatch(errorShow(error))
    )
  }
)

export const REGISTER_MESSAGE = 'REGISTER_MESSAGE'
export const REGISTER_RESET = 'REGISTER_RESET'

export const registerMessage = (message) => ({
  type: REGISTER_MESSAGE,
  message
})

export const registerReset = () => ({
  type: REGISTER_RESET
})

export const LOGIN_MESSAGE = 'LOGIN_MESSAGE'
export const LOGIN_RESET = 'LOGIN_RESET'
export const LOGIN_FINISHED = 'LOGIN_FINISHED'

export const loginMessage = (message) => ({
  type: LOGIN_MESSAGE,
  message
})

export const loginReset = () => ({
  type: LOGIN_RESET
})

export const loginFinished = (user, downloads) => ({
  type: LOGIN_FINISHED,
  user,
  downloads
})

export const PASSWORD_RESET_MESSAGE = 'PASSWORD_RESET_MESSAGE'
export const PASSWORD_RESET_RESET = 'PASSWORD_RESET_RESET'

export const passwordResetMessage = (message) => ({
  type: PASSWORD_RESET_MESSAGE,
  message
})

export const passwordResetReset = () => ({
  type: PASSWORD_RESET_RESET
})

export const USER_LOGGEDOUT = 'USER_LOGGEDOUT'

export const userLoggedout = () => ({
  type: USER_LOGGEDOUT
})

export const userLogout = () => (
  function (dispatch, getState) {
    const { endpoints } = getState()

    return api.delete(endpoints.sessions).then(() => {
      dispatch(userLoggedout())
      window.location = "/"
    })
  }
)

