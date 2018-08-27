import React, { Component } from 'react';
import classNames from 'classnames'
import _ from 'lodash'
import 'whatwg-fetch';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
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
class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      message: null,
      diableBtn: false,
      loginData: {
        username: "",
        password: ""
      },
      errors: {
        username: null,
        password: null
      }
    };

    this._onSubmit = this._onSubmit.bind(this);
    this._onTextFieldChange = this._onTextFieldChange.bind(this);
    this._formValidation = this._formValidation.bind(this);
    this._onTextFieldBlur = this._onTextFieldBlur.bind(this);

    document.title = "Forgot Password - Cuponarbitrage ";

  }
  componentDidMount() {



    const obj = getFromStorage('coupon_admin');
    if (obj && obj.token) {
      const { token } = obj;
      // Verify token
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token,
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



  _formValidation(fieldsToValidate = [], callback = () => { }) {
    const { loginData, diableBtn } = this.state;

    const allFields = {
      username: {
        message: "Please enter the user name.",
        doValidate: () => {
          const value = _.trim(_.get(loginData, 'username', ""));
          if (value.length > 0) {
            return true;
          }
          return false;
        }
      }
    };
    let errors = this.state.errors;
    _.each(fieldsToValidate, (field) => {
      const fieldValidate = _.get(allFields, field);
      if (fieldValidate) {
        errors[field] = null;
        const isFieldValid = fieldValidate.doValidate();
        if (isFieldValid === false) {
          errors[field] = _.get(fieldValidate, 'message');
        }
      }

    });



    this.setState({
      error: errors,
    }, () => {
      // console.log("After processed validation the form errors", errors);
      let isValid = true;
      this.setState({ diableBtn: true });
      _.each(errors, (err) => {
        if (err) {
          isValid = false;
          this.setState({ diableBtn: false });
        }
      });
      callback(isValid);
    })

  }
  _onSubmit(event) {
    toastr.clear();
    const { loginData, diableBtn } = this.state;
    event.preventDefault();
    let fieldNeedToValidate = ['username'];
    this._formValidation(fieldNeedToValidate, (isValid) => {

      if (isValid) {
        this.setState({ diableBtn: true });
        fetch('/api/account/forgot-password',
          {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
              username: loginData.username,
              password: loginData.password,
            })
          })
          .then(res => res.json())
          .then(json => {

            if (json.success) {
              setInStorage('coupon_admin', { token: json.token });
              toastr.success(json.message, '');
              this.setState({
                signInError: json.message,
                isLoading: false,
                diableBtn: false,
                username: '',
             
                token: json.token,
              });
            } else {
              toastr.error(json.message, 'Error!');
              this.setState({
                isLoading: false,
                diableBtn: true,
              });
            }
          });

      } else {
      }
    });
  }

  _onTextFieldChange(e) {
    let errors = this.state.errors;
    let { loginData } = this.state;
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    loginData[fieldName] = fieldValue;
    errors[fieldName] = null;
    this.setState({ loginData: loginData });
  }
  _onTextFieldBlur(e) {
    let { loginData } = this.state;
    let errors = this.state.errors;
    const fieldName = e.target.name;
    let fieldNeedToValidate = [fieldName];
    errors[fieldName] = null;
    this._formValidation(fieldNeedToValidate, (isValid) => {

    });

  }
  render() {
    const { loginData, error, message, token, diableBtn } = this.state;
    if (!token) {
      return (
        <>

          <center>
            <form onSubmit={this._onSubmit}>
              <p>
                <FormControl error={_.get(error, 'username')} aria-describedby="name-error-text" >
                  <InputLabel htmlFor="name-simple">Username</InputLabel>
                  <Input id="name-simple" name="username" value={loginData.username} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                  <FormHelperText id="name-error-text">{_.get(error, 'username')}</FormHelperText>
                </FormControl>
              </p>

              <button className="app-button primary" disabled={!diableBtn}>Submit</button>
              <Link to="/">Login?</Link>
            </form>

          </center>


        </>
      );
    }

    return (
      <>
        <Redirect to='/dashboard' />
      </>

    );
  }
}

export default ForgotPassword;
