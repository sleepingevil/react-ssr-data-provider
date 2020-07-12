import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { MyDataProvider } from './MyDataProvider'

ReactDOM.render(<MyDataProvider providers={{ getGreeting: async (name) => `Hello ${name} from the client side. I'm probably doing an http call or using a proxy to fetch data.` }}>
  <App />
</MyDataProvider>, document.getElementById('root'))
