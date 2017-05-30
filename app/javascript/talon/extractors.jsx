import 'whatwg-fetch'
import React from 'react'

class Extractors extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      loading: false,
      extractors: []
    }

    this.toggleExtractors = this.toggleExtractors.bind(this)
  }

  toggleExtractors(e) {
    e.preventDefault()

    if (!this.state.open && this.state.extractors.length == 0) {
      return this.loadExtractors()
    }

    this.setState({open: !this.state.open})
  }

  loadExtractors() {
    this.setState({loading: true})

    fetch(this.props.extractorsEndpoint)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      this.setState({extractors: json, loading: false, open: true})
    })
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="col-sm-12">
          Loading...
        </div>
      )
    }

    let extractors = this.state.extractors.map((extractor, index) =>
      <div className="col-sm-4" key={index}>{extractor}</div>
    )

    return (
      <div className="extractors">
        <div className="col-sm-12">
          <a onClick={this.toggleExtractors}>{this.state.open ? 'Hide' : 'List'} supported sites</a>
        </div>
        <div className={this.state.open ? 'list col-sm-12' : 'list col-sm-12 hidden'}>
          {extractors}
        </div>
      </div>
    );
  }
}

export default Extractors
