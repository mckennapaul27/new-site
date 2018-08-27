import React from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom'

import App from './components/App/App';
import CusRouter from './components/CusRouter';
import './styles/styles.scss';
import '../public/assets/js/custom-js.js';

render((
  <Router>
    <App>
      <CusRouter/>
    </App>
  </Router>
), document.getElementById('app'));
