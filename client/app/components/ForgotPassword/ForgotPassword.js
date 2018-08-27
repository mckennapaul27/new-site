import React, { Component } from 'react';
import classNames from 'classnames'
import _ from 'lodash'
import 'whatwg-fetch';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import toastr from 'toastr'
import RCG from 'react-captcha-generator';

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
      captchaWord: "",
      loginData: {
        username: "",
        password: "",
        captcha: "",
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
    this.result = this.result.bind(this);
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
      }, captcha: {
        message: "Please enter the security code.",
        doValidate: () => {
          const value = _.get(loginData, 'captcha', '');
          if (value && value.length > 0) {
            return true;
          }
          return false;
        }
      },
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
    const { loginData, diableBtn,captchaWord } = this.state;
    event.preventDefault();
    let fieldNeedToValidate = ['username', 'captcha'];
    this._formValidation(fieldNeedToValidate, (isValid) => {
      let errors = this.state.errors;
      errors['captcha'] = null;
      if (captchaWord != loginData.captcha) {
        errors['captcha'] = 'Please enter valid security code';
        return false;
      }
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
  result(text) {
    this.setState({
      captchaWord: text
    })
  }
  render() {
    const { loginData, error, message, token, diableBtn } = this.state;
    if (!token) {
      return (
        <>
          <section className="login-wrap">
            <div className="container-fluid log-conatiner">
              <div className="row justify-content-center align-items-center log-row">

                <div className="log-sec-wrap">

                  <div className="log-sec">

                    <div className="login-form">
                      <div className="ad-icon">
                        <span>
                          <img src="/assets/images/football-new.svg" alt="couponarbitrage" />
                        </span>
                      </div>
                      <h4>Forgot Password</h4>
                      <form onSubmit={this._onSubmit}>
                        <div className="form-group">
                          <FormControl fullWidth error={_.get(error, 'username')} aria-describedby="name-error-text">
                            <InputLabel htmlFor="name-simple">Username</InputLabel>
                            <Input id="name-simple" name="username" value={loginData.username} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                            <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'username')}</FormHelperText>
                          </FormControl>
                        </div>

                        <div className="form-group">

                          <div className="row">
                            <div className="col-xs-4 "><RCG result={this.result} />
                            </div><div className="col-xs-8 ">
                              <FormControl fullWidth error={_.get(error, 'captcha')} aria-describedby="captcha-error-text" >
                                <InputLabel htmlFor="captcha-id">Security  Code</InputLabel>
                                <Input type="text" id="captcha-id" name="captcha" value={loginData.captcha} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                                <FormHelperText className="errtext" id="captcha-error-text">{_.get(error, 'captcha')}</FormHelperText>
                              </FormControl>
                            </div></div>


                        </div>

                        <div className="text-center">
                          <button className="btn btn-login" disabled={!diableBtn}>Submit</button>
                          <Link className="frgt-pswrd" to="/">Login?</Link>
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

export default ForgotPassword;
