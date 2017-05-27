import 'whatwg-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import '../app-style'

class Downloader extends React.Component {
  constructor() {
    super();

    this.state = {extractorsOpen: false};

    this.handleContinue = this.handleContinue.bind(this);
    this.toggleExtractors = this.toggleExtractors.bind(this);
  }

  handleContinue(e) {
    e.preventDefault();
  }

  toggleExtractors(e) {
    e.preventDefault();
    this.setState({extractorsOpen: !this.state.extractorsOpen});
  }

  render() {
    let extractorsTitle = this.state.extractorsOpen ? "Hide supported sites" : "List supported sites";
    let extractorsClass = this.state.extractorsOpen ? "extractors col-sm-12" : "extractors col-sm-12 hidden";
    let extractors = this.props.extractors.map((extractor, index) =>
      <div className="col-sm-4" key={index}>{extractor}</div>
    );

    return (
      <div className="col-sm-8 col-sm-offset-2">
        <div className="panel panel-primary">
          <div className="panel-body">
            <form>
              <div className="col-sm-9 form-group">
                <input type="text" className="form-control" placeholder="Video address" />
              </div>
              <div className="col-sm-3 text-center">
                <button type="submit" className="btn btn-primary" onClick={this.handleContinue}>{'Continue'}</button>
              </div>
            </form>
            <div className="col-sm-12">
              <a onClick={this.toggleExtractors}>{extractorsTitle}</a>
            </div>
            <div className={extractorsClass}>
              {extractors}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class List extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="col-sm-12">
       <div className="panel panel-default">
          <div className="panel-heading">Queue</div>
          <div className="panel-body">
            <div className="video">Video</div>
            <div className="video">Video</div>
          </div>
        </div>
      </div>
    );
  }
}

class Talon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Downloader extractors={this.props.extractors} />
        <List />
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('talon')
  const data = JSON.parse(node.getAttribute('data'))

  ReactDOM.render(<Talon {...data} />, node)
})
