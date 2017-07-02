import { createMuiTheme } from 'material-ui/styles'
import createPalette from 'material-ui/styles/palette'
import { deepOrange, lightBlue } from 'material-ui/styles/colors'

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
    }
  }
})
