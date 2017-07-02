import React from 'react'
import PropTypes from 'prop-types'
import Error from '../components/error'
import Search from '../components/search'
import List from '../components/list'

const App = ({cable}) => {
  return (
    <div>
      <Error />
      <Search />
      <List cable={cable} />
    </div>
  )
}

App.propTypes = {
  cable: PropTypes.object.isRequired
}

export default App
