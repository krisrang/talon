import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { withStyles, createStyleSheet } from 'material-ui/styles'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
  withResponsiveFullScreen,
} from 'material-ui/Dialog'
import Drawer from 'material-ui/Drawer'
import Button from 'material-ui/Button'
import Avatar from 'material-ui/Avatar'
import Divider from 'material-ui/Divider'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import HelpIcon from 'material-ui-icons/Help'
import MenuIcon from 'material-ui-icons/Menu'
import PersonIcon from 'material-ui-icons/Person'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import { primary } from './themes'

const styleSheet = createStyleSheet('MainMenuAvatar', {
  avatar: {
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: primary[300],
    background: primary[300],
    width: 60,
    height: 60,
  }
})

class FaqQuestion extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }

    this.handleToggleOpen = this.handleToggleOpen.bind(this)
  }

  handleToggleOpen() {
    this.setState({open: !this.state.open})
  }

  render() {
    const { q, children } = this.props
    const expandClass = classNames("expand", {"expanded": this.state.open})
    const answerClass = classNames("faqanswer", {"expanded": this.state.open})

    return (
      <div>
        <div className="faqquestion">
          <IconButton className={expandClass} onClick={this.handleToggleOpen}>
            <ExpandMoreIcon />
          </IconButton>
          <a onClick={this.handleToggleOpen}>{q}</a>
        </div>
        <div className={answerClass}>
          {children}
        </div>
      </div>
    )
  }
}
FaqQuestion.propTypes = {
  q: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
      PropTypes.object.isRequired,
      PropTypes.array.isRequired,
  ]),
}

const ResponsiveDialog = withResponsiveFullScreen({breakpoint: 'xs'})(Dialog)

class MainMenu extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      drawerOpen: false,
      faqOpen: false,
    }

    this.handleDrawerOpen = this.handleDrawerOpen.bind(this)
    this.handleDrawerClose = this.handleDrawerClose.bind(this)
    this.handleFaqOpen = this.handleFaqOpen.bind(this)
    this.handleFaqClose = this.handleFaqClose.bind(this)
  }

  handleDrawerOpen() {
    this.setState({drawerOpen: true})
  }

  handleDrawerClose() {
    this.setState({drawerOpen: false})
  }

  handleFaqOpen() {
    this.setState({drawerOpen: false, faqOpen: true})
  }

  handleFaqClose() {
    this.setState({faqOpen: false})
  }
  
  avatar(size=60) {
    return this.props.user.gravatar_template.replace("{size}", size)
  }

  renderGuest() {
    const { classes } = this.props

    return (
      <div className="useritem">
        <Avatar className={classes.avatar}>
          <PersonIcon />
        </Avatar>
        <Typography type="body1" gutterBottom align="center">
          Log in now to access your videos anywhere.
        </Typography>
        <Link to="/login">
          <Button raised color="primary">{"Login"}</Button>
        </Link>
      </div>
    )
  }

  renderUser() {
    const { classes, user, userLogout } = this.props

    return (
      <div className="useritem">
        <Avatar alt={user.email} src={this.avatar()} className={classes.avatar} />
        <Typography type="body2" gutterBottom align="center">
          {user.email}
        </Typography>
        <Button raised color="primary" onClick={userLogout}>Logout</Button>
      </div>
    )
  }

  render() {
    const { user } = this.props

    return (
      <div>
        <IconButton color="contrast" aria-label="Menu" onClick={this.handleDrawerOpen}>
          <MenuIcon />
        </IconButton>
        <Drawer
          className="mainmenu"
          open={this.state.drawerOpen}
          onRequestClose={this.handleDrawerClose}>
          {(user && user.id) ? this.renderUser() : this.renderGuest()}
          <Divider />
          <List disablePadding>
            <ListItem button onClick={this.handleFaqOpen}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="FAQ" />
            </ListItem>
          </List>
        </Drawer>
        <ResponsiveDialog className="faqdialog" maxWidth="md" open={this.state.faqOpen} onRequestClose={this.handleFaqClose}>
          <DialogTitle>
            {"FAQ"}
          </DialogTitle>
          <DialogContent>
            <FaqQuestion q="What is Talon?">
              <p>Talon is the easiest way to download videos from almost any common site and post-processes them based on options you set.</p>
              <p>All you need to do is enter the link in the search bar at the top. Available options include video/audio format, audio only downloads, and notifying by email when download completes.</p>
            </FaqQuestion>
            <FaqQuestion q="What sites can videos be downloaded from?">
              <p>All of the popular ones like YouTube, Vimeo, Twitch, Twitter, etc but also lots of other sites.</p>
              <p><a href="/extractors" rel="noopener noreferrer" target="_blank">See here for the full list</a>.</p>
            </FaqQuestion>
            <FaqQuestion q="Do I need to register?">
              <p>
                {"Registering is never required to download videos. However, if you'd like to keep track of everything you've downloaded, you should "}
                <Link to="/register">create an account.</Link>
              </p>
            </FaqQuestion>
            <FaqQuestion q="Are there any limits?">
              <p>
                At the moment no but in the future downloads of unregistered users may be deleted a certain amount of time after the download completes.
              </p>
            </FaqQuestion>
            <p>Contact us: <a href="mailto:help@talon.rip">help@talon.rip</a></p>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleFaqClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </ResponsiveDialog>
      </div>
    )
  }
}
MainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  userLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
}

export default withStyles(styleSheet)(MainMenu)
