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


// const name = props.location.state ? props.location.state.name : "Ft8oDW1I88";
// const room = props.location.state ? props.location.state.room : "L9G0wsnCAz";