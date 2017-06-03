import 'whatwg-fetch'
import React from 'react'

class Extractors extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      extractors: []
    }

    this.openExtractors = this.openExtractors.bind(this)
  }

  componentDidMount() {
    $('#extractorModal').modal()
  }

  openExtractors(e) {
    e.preventDefault()

    if (this.state.extractors.length == 0) {
      return this.loadExtractors()
    }

    $('#extractorModal').modal('open')
  }

  loadExtractors() {
    this.setState({loading: true})

    fetch(this.props.extractorsEndpoint)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      this.setState({extractors: json, loading: false})
      $('#extractorModal').modal('open')
    })
  }

  render() {
    if (this.props.hide) {
      return null
    }

    let extractors = this.state.extractors.map((extractor, index) =>
      <div className="col s3" key={index}>{extractor}</div>
    )

    return (
      <div className="extractors">
        <div className="col s12">
          {this.state.loading ?
            "Loading..." :
            (<a onClick={this.openExtractors}>Show supported sites</a>)
          }
        </div>
        <div id="extractorModal" className="modal modal-fixed-footer black-text">
          <div className="modal-content">
            <h4>Supported Sites</h4>
            <div className="col s12">
              {extractors}
            </div>
          </div>
          <div className="modal-footer">
            <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Extractors
