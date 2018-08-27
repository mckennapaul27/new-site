import React, { Component } from 'react';
import 'whatwg-fetch';
import toastr from 'toastr'

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from 'react-router-dom'
import {
  setInStorage,
  getFromStorage,
} from '../../utills/common';
class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      message: null,
      diableBtn: false,

    };

    document.title = "Login - Cuponarbitrage ";

  }
  componentDidMount() {

    const obj = getFromStorage('coupon_admin');
    if (obj && obj.token) {
      const { token } = obj;
      // Verify token
      fetch('/api/account/logout?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            toastr.success('You have logged out!', '');
            setInStorage('coupon_admin', { token: '' });
            setInStorage('coupon_login_id', { token: '' });
            this.setState({
              token: '',
              isLoading: false
            });
          } else {
            this.setState({
              isLoading: false,
            });
          }
        });
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }





  render() {

    return (
      <>
        <Redirect to='/' />
      </>

    );
  }
}

export default Logout;
