import React from 'react';

import Home from './components/Home'
import Tetris from './components/Tetris'
import { HashRouter as Router, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router hashType="noslash" >
        <Route exact path="/" component={Home} />
        <Route exact path="/:roomId" component={Tetris} />
      </Router>
    </div>
  );
}

export default App;