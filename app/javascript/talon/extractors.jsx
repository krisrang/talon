import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button } from 'react-bootstrap'
import Utils from './utils'

class Extractors extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      open: false,
      extractors: []
    }

    this.openExtractors = this.openExtractors.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  openExtractors() {
    if (this.state.extractors.length == 0) {
      return this.loadExtractors()
    }

    this.open()
  }

  close() {
    this.setState({ open: false })
  }

  open() {
    this.setState({ open: true })
  }

  loadExtractors() {
    this.setState({loading: true})

    Utils.requestGet(this.props.extractorsEndpoint)
    .done((json) => {
      this.setState({extractors: json, loading: false})
      this.open()
    })
  }

  render() {
    let extractors = this.state.extractors.map((extractor, index) =>
      <div className="col-sm-3" key={index}>{extractor}</div>
    )

    return (
      <div>
        {this.state.loading ?
          (<i className="loading-spinner fa fa-circle-o-notch fa-spin fa-fw"></i>) :
          (<a onClick={this.openExtractors} alt="Supported sites"><i className="fa fa-question-circle"></i></a>)
        }
        <Modal show={this.state.open} bsSize="large" onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Supported Sites</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">{extractors}</div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
Extractors.propTypes = {
  extractorsEndpoint: PropTypes.string.isRequired,
}

export default Extractors
