import { createMuiTheme } from 'material-ui/styles'
import createPalette from 'material-ui/styles/palette'
import { deepOrange, lightBlue, grey } from 'material-ui/colors'

export default createMuiTheme({
  palette: createPalette({
    // type: 'dark',
    primary: lightBlue,
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
