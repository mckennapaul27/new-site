import React, { Component } from 'react';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import _ from 'lodash'
import 'whatwg-fetch';
import toastr from 'toastr'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ReactLoading from 'react-loading';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  Switch,
  Redirect
} from 'react-router-dom'
import {
  setInStorage,
  getFromStorage,
} from '../../utills/common';
class MyAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' My Accounts',
      arrayList: '',
      isLoading: false,
      logout: false,
      checked: false,
      diableBtn:false,
      accountData: {
        _id: '',
        name: '',
        username: "",
        email: "",
        password: "",
        cpassword: "",
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
    this._handleChange = this._handleChange.bind(this);
    document.title = "My Accounts";
    document.body.classList.remove('login-body');
  }
  componentDidMount() {
    const obj = getFromStorage('coupon_admin');
    const coupon_login_id = getFromStorage('coupon_login_id');
    console.log();
    if (obj && obj.token) {
      const { token } = obj;
      // Verify token
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token
            });
          } else {
            this.setState({
              logout: true
            });
          }
        });
    } else {
      this.setState({
        logout: true
      });
    }

    fetch('/api/admin/getaccountby_id?login_id=' + coupon_login_id.token)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const userRow = json.result;
          this.setState({
            accountData: {
              _id: userRow._id,
              name: userRow.name,
              username: userRow.username,
              email: userRow.email,

            }
          });
        }
      });

  }
  _formValidation(fieldsToValidate = [], callback = () => { }) {
    const { accountData, diableBtn } = this.state;
    const allFields = {
      name: {
        message: "Please enter the  name.",
        doValidate: () => {
          const value = _.trim(_.get(accountData, 'name', ""));
          if (value.length > 0) {
            return true;
          }
          return false;
        }
      },
      username: {
        message: "Please enter the user name.",
        doValidate: () => {
          const value = _.trim(_.get(accountData, 'username', ""));
          if (value.length > 0) {
            return true;
          }
          return false;
        }
      },
      password: {
        message: "Please enter the password.",
        doValidate: () => {
          const value = _.get(accountData, 'password', '');
          if (value && value.length > 0) {
            return true;
          }
          return false;
        }
      }, cpassword: {
        message: "Confirm password does't match with password.",
        doValidate: () => {
          const vpassword = _.trim(_.get(accountData, 'password', ""));
          const vcpassword = _.trim(_.get(accountData, 'cpassword', ""));
          if (vpassword.length > 0 && vpassword == vcpassword) {
            return true;
          }
          return false;
        }
      }, email: {
        message: "Please enter valid email.",
        doValidate: () => {
          const value = _.get(accountData, 'email', '');
          const emailValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
          if (emailValid) {
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
    const { accountData, diableBtn, captchaWord, checked } = this.state;
    event.preventDefault();
    let fieldNeedToValidate = [];
    if (checked) {
      fieldNeedToValidate = ['name', 'username', 'email', 'password', 'cpassword'];
    } else {
      fieldNeedToValidate = ['name', 'username', 'email'];
    }

    this._formValidation(fieldNeedToValidate, (isValid) => {
      if (isValid) {
        this.setState({ diableBtn: true });
        fetch('/api/admin/update-myaccount',
          {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
              _id: accountData._id,
              name: accountData.name,
              username: accountData.username,
              email: accountData.email,
              password: accountData.password,
              cpassword: accountData.cpassword,
              changePassword: checked,
            })
          })
          .then(res => res.json())
          .then(json => {
            toastr.clear();
            if (json.success) {
              toastr.success(json.message, '');
              this.setState({
                signInError: json.message,
                isLoading: false,
                diableBtn: false,
                username: '',
                password: '',
                cpassword: '',

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
    let { accountData } = this.state;
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    accountData[fieldName] = fieldValue;
    errors[fieldName] = null;
    this.setState({ accountData: accountData });
  }
  _onTextFieldBlur(e) {
    let { accountData } = this.state;
    let errors = this.state.errors;
    const fieldName = e.target.name;
    let fieldNeedToValidate = [fieldName];
    errors[fieldName] = null;
    this._formValidation(fieldNeedToValidate, (isValid) => {

    });

  }
  _handleChange(e) {
    var checked = e.target.checked;
    let errors = this.state.errors;
    this.setState({ checked: checked });
    if (!checked) {
      errors['password'] = null;
      errors['cpassword'] = null;
    }


  }
  render() {

    const { logout, accountData, error,diableBtn,pageTitle, passval, arrayList, isLoading, checked } = this.state;
    const subBtn = !diableBtn?<> <ReactLoading type="cylon" color="#2cbb68" width={'5%'} /> </>:'';
    const passContent = checked ? <>
      <div className="ad-form col-lg-4 col-sm-6">
        <div className="form-group">
          <FormControl fullWidth error={_.get(error, 'password')} aria-describedby="password-error-text" >
            <InputLabel htmlFor="password-id">Password</InputLabel>
            <Input type="password" id="password-id" name="password" value={accountData.password} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
            <FormHelperText className="errtext" id="password-error-text">{_.get(error, 'password')}</FormHelperText>
          </FormControl>

        </div>
      </div>
      <div className="ad-form col-lg-4 col-sm-6">
        <div className="form-group">
          <FormControl fullWidth error={_.get(error, 'cpassword')} aria-describedby="cpassword-error-text" >
            <InputLabel htmlFor="cpassword-simple">Confirm Password</InputLabel>
            <Input type="password" id="cpassword-simple" name="cpassword" value={accountData.cpassword} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
            <FormHelperText className="errtext" id="cpassword-error-text">{_.get(error, 'cpassword')}</FormHelperText>
          </FormControl>

        </div>
      </div>
    </> : null;

    if (!logout) {
      return (
        <>
          <div className="ad-wrapper">
            <Navbar />
            <div className="inner-wrapper">
            <Header pageTitle={pageTitle} />
              <div className="page-wrapper">
                <div className="container-fluid">
                  <div className="brd-srch-links">
                    <ul className="bread-crumb">
                      <li><NavLink to="/dashboard"><i className={`fa fa-home`} ></i> Dashboard</NavLink></li>
                      <li><a>Administrators</a></li>
                      <li><a className="active">My Account</a></li>
                    </ul>
                  </div>
                  <div className="white-box">
                    <form onSubmit={this._onSubmit}>
                      <div className="row">
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'name')} aria-describedby="name-error-text" >
                              <InputLabel htmlFor="name-simple">Name</InputLabel>
                              <Input id="name-simple" name="name" value={accountData.name} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'name')}</FormHelperText>
                            </FormControl>

                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'username')} aria-describedby="username-error-text" >
                              <InputLabel htmlFor="username-id">username</InputLabel>
                              <Input type="text" id="username-id" name="username" value={accountData.username} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="username-error-text">{_.get(error, 'username')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'email')} aria-describedby="email-error-text" >
                              <InputLabel htmlFor="email-simple">email</InputLabel>
                              <Input id="email-simple" name="email" value={accountData.email} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="email-error-text">{_.get(error, 'email')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xs-12">
                          <div className="form-group">
                            <FormControlLabel control={
                              <Checkbox
                                value="1"
                                color="primary"
                                onChange={this._handleChange}

                              />} label="Change Password?" />
                          </div>
                        </div>
                        {passContent}
                      </div>
                    
                      <button type="submit" className="bnt ad-cmn-btn btn-submit">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <Redirect to='/' />
      </>

    );
  }
}


export default MyAccount;
