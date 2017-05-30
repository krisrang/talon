import 'whatwg-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Downloader from '../talon/downloader'
import '../styles'

class List extends React.Component {
  constructor() {
    super()
  }

  componentDidMount() {
    $('.downloadlist .tabs').tabs();
  }

  render() {
    return (
      <div className="row">
        <div className="downloadlist container">
          <div className="col s12">
            <div className="white z-depth-1">
              <div>
                <ul className="tabs tabs-fixed-width">
                  <li className="tab col s3"><a className="active" href="#activedownloads">Active</a></li>
                  <li className="tab col s3"><a href="#donedownloads">Finished</a></li>
                </ul>
              </div>
              <div id="activedownloads">Test 1</div>
              <div id="donedownloads">Test 2</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Talon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Downloader {...this.props} />
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
