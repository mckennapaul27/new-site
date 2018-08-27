import React, { Component } from 'react';
import {
  setInStorage,
  getFromStorage,
} from '../../utills/common';
class App extends Component {

  constructor(props) {
    super(props);

  }

  
  render() {
    return (
      <>
       
        <main>{this.props.children}</main>


      </>

    );
  }
}


export default App;
