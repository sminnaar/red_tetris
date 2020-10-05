import React from 'react';

import Tetris from './components/Tetris'
// import Home from './components/Home';
import Lobby from './components/Lobby';
import { HashRouter as Router, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router hashType="noslash" >
        <Route path="/" exact component={Lobby} />
        <Route path="/:RoomName" render={(props) => <Tetris {...props} />} />
      </Router>
    </div>
  );
}

export default App;
