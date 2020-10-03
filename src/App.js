import React from 'react';

import Tetris from './components/Tetris'
import Join from './components/Join';
import { HashRouter as Router, Route } from 'react-router-dom';

// import Chat from './components/Chat'

function App() {
  return (
    <div className="App">
      <Router hashType="noslash" >
        <Route path="/" exact component={Join} />
        <Route path="/:RoomName" render={(props) => <Tetris {...props} />} />
      </Router>
      {/* <Tetris /> */}
      {/* <Chat /> */}
    </div>
  );
}



export default App;
