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
class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      message: null,
      diableBtn: false,
      accessPassPage: false,
      key: '',
      redirectPage: false,
      loginData: {
        cpassword: "",
        password: ""
      },
      errors: {
        cpassword: null,
        password: null
      }
    };

    this._onSubmit = this._onSubmit.bind(this);
    this._onTextFieldChange = this._onTextFieldChange.bind(this);
    this._formValidation = this._formValidation.bind(this);
    this._onTextFieldBlur = this._onTextFieldBlur.bind(this);

    document.title = "Change Password - Cuponarbitrage ";

  }
  componentDidMount() {

    const key = this.props.match.params.key;

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

    if (key) {

      fetch('/api/account/verify_key?key=' + key)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              key: key,
              accessPassPage: true
            });
          } else {

            this.setState({
              accessPassPage: false,
            });
          }
        });
    } else {

      this.setState({
        accessPassPage: false,
      });
    }


  }



  _formValidation(fieldsToValidate = [], callback = () => { }) {
    const { loginData, diableBtn } = this.state;
    const allFields = {
      password: {
        message: "Please enter the password.",
        doValidate: () => {
          const value = _.trim(_.get(loginData, 'password', ""));
          if (value.length > 0) {
            return true;
          }
          return false;
        }
      }, cpassword: {
        message: "Confirm password does't match with password.",
        doValidate: () => {
          const vpassword = _.trim(_.get(loginData, 'password', ""));
          const vcpassword = _.trim(_.get(loginData, 'cpassword', ""));
          if (vpassword.length > 0 && vpassword == vcpassword) {
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
    const { loginData, diableBtn, key } = this.state;
    event.preventDefault();
    let fieldNeedToValidate = ['password', 'cpassword'];
    this._formValidation(fieldNeedToValidate, (isValid) => {

      if (isValid) {
        this.setState({ diableBtn: true });
        fetch('/api/account/update-password',
          {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
              password: loginData.password,
              cpassword: loginData.cpassword,
              _id: key
            })
          })
          .then(res => res.json())
          .then(json => {
            if (json.success) {
              toastr.success(json.message, '');
              this.setState({
                signInError: json.message,
                isLoading: false,
                diableBtn: false,
                redirectPage: true,
              });
            } else {
              toastr.error(json.message, 'Error!');
              this.setState({
                isLoading: false,
                diableBtn: true,
              });
            }
          });

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
    const { loginData, error, message, token, diableBtn, accessPassPage, redirectPage } = this.state;
    if (redirectPage) {
      return (
        <>
          <Redirect to='/' />
        </>

      );
    }
    if (!accessPassPage) {
      return (
        <>
          <p>Invlaid URL.</p>
          <Link to="/">Login?</Link>
        </>

      );
    }

    if (!token) {
      return (
        <>

          <section class="login-wrap">
            <div class="container-fluid log-conatiner">
              <div class="row justify-content-center align-items-center log-row">

                <div class="log-sec-wrap">

                  <div class="log-sec">

                    <div class="login-form">
                      <div class="ad-icon">
                        <span>
                          <img src="/assets/images/football-new.svg" alt="couponarbitrage" />
                        </span>
                      </div>
                      <h4>Change Password</h4>
                      <form onSubmit={this._onSubmit}>
                        <div class="form-group">
                          <FormControl fullWidth error={_.get(error, 'password')} aria-describedby="name-error-text" >
                            <InputLabel htmlFor="name-simple">Password</InputLabel>
                            <Input type="password" id="name-simple" name="password" value={loginData.password} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                            <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'password')}</FormHelperText>
                          </FormControl>
                        </div>
                        <div class="form-group">
                          <FormControl fullWidth error={_.get(error, 'cpassword')} aria-describedby="name-error-text" >
                            <InputLabel htmlFor="name-simple">Confirm Password</InputLabel>
                            <Input type="password" id="name-simple" name="cpassword" value={loginData.cpassword} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                            <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'cpassword')}</FormHelperText>
                          </FormControl>
                        </div>
                        <div class="text-center">
                          <button class="btn btn-login" disabled={!diableBtn}>Submit</button>
                         
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

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

export default ChangePassword;
