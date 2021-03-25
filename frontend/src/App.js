import React, { useEffect, useState } from 'react';
import './App.css';
import { Users } from './Users.js'

import axios from 'axios';

// React functional component
function App () {
  // ENTER YOUR EC2 PUBLIC IP/URL HERE
  const ec2_url = ''
  // CHANGE THIS TO TRUE IF HOSTING ON EC2, MAKE SURE TO ADD IP/URL ABOVE
  const ec2 = false;
  // USE localhost OR ec2_url ACCORDING TO ENVIRONMENT
  const url = ec2 ? ec2_url : 'localhost'


  return (
    <div className="App">
      <header className="App-header">
      </header>
      <Users />
    </div>
  );
}

export default App;
