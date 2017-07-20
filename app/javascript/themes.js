import { createMuiTheme } from 'material-ui/styles'
import createPalette from 'material-ui/styles/palette'
import { deepOrange, blue, grey } from 'material-ui/colors'

export let primary = blue

export default createMuiTheme({
  palette: createPalette({
    // type: 'dark',
    primary: blue,
    accent: deepOrange
  }),
  overrides: {
    MuiDialogContent: {
      root: {
        "-webkit-overflow-scrolling": "touch"
      }
    },
    MuiButton: {
      raisedPrimary: {
        color: grey[50],
      }
    }
  }
})
