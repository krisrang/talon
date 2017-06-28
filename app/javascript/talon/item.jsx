import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
// import { CSSTransitionGroup } from 'react-transition-group'
import Card, { CardContent } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import { LinearProgress } from 'material-ui/Progress'
import IconButton from 'material-ui/IconButton'
import Collapse from 'material-ui/transitions/Collapse'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import Utils from './utils'

class Item extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      ...props.item,
      expanded: false,
      error: false
    }

    this.handleExpandClick = this.handleExpandClick.bind(this)
  }

  componentWillMount() {
    this.subscribe()
  }

  componentDidMount() {
    this.startDownload()
  }

  componentWillUnmount(){ 
    this.unsubscribe()
  }

  subscribe() {
    // let cr = false
    // let lines = []

    this.subscription = this.props.consumer.subscriptions.create({channel: "DownloadChannel", key: this.state.key}, {
      received: (data) => {
        if (data.progress && data.progress.percent < 100 && data.progress.percent === this.state.percent) {
          return;
        }
        
        this.setState({starting: false})

        if (data.progress) this.setState({percent: data.progress.percent})
        if (data.progress_label) this.setState({progressLabel: data.progress_label})
        if (data.lines) this.setState({log: data.lines.join("\n")})

        if (data.url) {
          this.unsubscribe()
          this.setState({finished_url: data.url, started: false})
        } else if (data.error) {
          this.unsubscribe()
          this.setState({percent: 0, started: false, finished_url: ""})
          this.error(data.error)
        }
      }
    })
  }

  unsubscribe() {
    this.subscription && this.props.consumer.subscriptions.remove(this.subscription)
  }

  startDownload() {
    if (this.state.status === "initial") {
      this.setState({starting: true, progressLabel: "Waiting for download to start..."})

      let url = this.props.downloadsEndpoint + "/" + this.state.key + "/start"

      Utils.requestPost(url)
      .done((json) => {
        if (json.error) {
          this.error(json.error)
          return
        }
      })
      .fail((err) => {
        this.error(err.responseJSON ? err.responseJSON.error : err.responseText)
      })
    }
  }

  error(message) {
    this.setState({error: true, expanded: true, log: message})
  }

  durationHuman(item) {
    let duration = item.duration
    let sections = []
    let hours = Math.floor((duration %= 86400) / 3600)
    let minutes = Math.floor((duration %= 3600) / 60)
    let seconds = duration % 60

    if (hours) sections.push(Utils.pad(hours, 2))
    sections.push(Utils.pad(minutes, 2))
    sections.push(Utils.pad(seconds, 2))

    return sections.join(":")
  }

  handleExpandClick() {
    this.setState({ expanded: !this.state.expanded })
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  scrollToBottom() {
    if (this.preNode) this.preNode.scrollTop = 2000
  }

  render() {
    let expandClass = classNames("expand", {"expandOpen": this.state.expanded})
    let progressMode = this.state.starting ? "indeterminate" : "determinate"

    return (
      <Card className="card">
        <div className="details">
          <CardContent className="content">
            <Typography type="headline">{this.state.title}</Typography>
            <Typography type="subheading" color="secondary">
              {this.state.extractor}
            </Typography>
            <Typography type="body2" color="secondary">
              {this.durationHuman(this.state)}
            </Typography>
          </CardContent>
          <div className="controls">
            <IconButton className={expandClass} onClick={this.handleExpandClick}>
              <ExpandMoreIcon />
            </IconButton>
            <div className="progress">
              <Typography type="body1" color="secondary" align="center">
                {this.state.progressLabel}
              </Typography>
              <LinearProgress mode={progressMode} value={this.state.percent} className="progressbar" />
            </div>
          </div>
        </div>
        <div className="cover">
          <div className="thumbnail" style={{backgroundImage: "url("+this.state.thumbnail_url+")"}} />
        </div>
        <Collapse className="logs" in={this.state.expanded} transitionDuration="auto" unmountOnExit>
          <CardContent>
            <pre ref={node => this.preNode = node}>
              {this.state.log}
            </pre>
          </CardContent>
        </Collapse>
      </Card>
    )
  }
}
Item.propTypes = {
  // classes: PropTypes.object.isRequired,
  consumer: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  // showError: PropTypes.func.isRequired,
  downloadsEndpoint: PropTypes.string.isRequired,
}

export default Item
