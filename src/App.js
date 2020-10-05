import React from 'react';

import Tetris from './components/Tetris'
import Join from './components/Join';
import { HashRouter as Router, Route } from 'react-router-dom';

// import Chat from './components/Chat'

import ChatRoom from './components/ChatRoom/ChatRoom'
import Home from './components/ChatRoom/Home'

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


// const name = props.location.state ? props.location.state.name : "Ft8oDW1I88";
// const room = props.location.state ? props.location.state.room : "L9G0wsnCAz";