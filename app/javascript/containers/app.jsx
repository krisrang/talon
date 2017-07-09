import React from 'react'
import { Route } from 'react-router-dom'
import Error from '../components/error'
import Search from '../components/search'
import List from '../components/list'

const App = () => {
  return (
    <div>
      <Error />
      <Route exact path="/" component={Search} />
      <Route exact path="/" component={List} />
    </div>
  )
}

export default App
