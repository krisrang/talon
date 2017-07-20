import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { withStyles, createStyleSheet } from 'material-ui/styles'
import Button from 'material-ui/Button'
import Menu, { MenuItem } from 'material-ui/Menu'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import { primary } from '../themes'

const styleSheet = createStyleSheet('ImageAvatars', {
  avatar: {
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: primary[300],
    background: primary[300],
  }
})

class UserBit extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      menuAnchor: undefined,
      menuOpen: false,
    }
  }

  handleMenuOpen(e) {
    this.setState({ menuOpen: true, menuAnchor: e.currentTarget })
  }

  handleMenuClose() {
    this.setState({ menuOpen: false })
  }
  
  avatar(size=40) {
    return this.props.user.gravatar_template.replace("{size}", size)
  }

  renderMenu() {
    const { user, classes, userLogout } = this.props

    return (
      <div>
        <IconButton onClick={(e) => this.handleMenuOpen(e)}>
          <Avatar alt={user.email} src={this.avatar()} className={classes.avatar} />
        </IconButton>
        <Menu
          id="usermenu"
          anchorEl={this.state.menuAnchor}
          open={this.state.menuOpen}
          onRequestClose={() => this.handleMenuClose()}>
          <MenuItem disabled>{user.email}</MenuItem>
          <MenuItem onClick={userLogout}>Logout</MenuItem>
        </Menu>
      </div>
    )
  }

  renderLoginButton() {
    return (
      <Link to="/login" className="loginbtn">
        <Button>{"Login"}</Button>
      </Link>
    )
  }

  render() {
    const { user } = this.props

    return (
      <div className="userbit">
        {(user && user.id) ? this.renderMenu() : this.renderLoginButton()}
      </div>
    )
  }
}
UserBit.propTypes = {
  classes: PropTypes.object.isRequired,
  userLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
}

export default withStyles(styleSheet)(UserBit)
