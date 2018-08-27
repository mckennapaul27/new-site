import React, { Component } from 'react';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import 'whatwg-fetch';
import toastr from 'toastr'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ReactTooltip from 'react-tooltip';
import MaskedInput from 'react-text-mask';
import PropTypes from 'prop-types';
import Divider from '@material-ui/core/Divider';

import {
  Link,
  NavLink,
  Redirect
} from 'react-router-dom'
import {
  getFromStorage,
  getCountries,
  hearAboutUs
} from '../../utills/common';
class UserManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' User Accounts',
      pageSubTitle: ' Manage User Accounts',
      arrayList: '',
      isLoading: false,
      logout: false,
      checked: true,
      passChecked: false,
      emailChecked: true,
      redirectPage: false,
      editAction: false,
      accountData: {
        _id: '',
        name: '',
        last_name: '',
        username: "",
        email: "",
        password: "",
        cpassword: "",
        accountCountry:"",
        accountPhone:"",
        accountReferrence: "",
        accountSkrillEmail: "",
        accountNetellerEmail: "",
        accountPaypalEmail: "",
        bankAccountName: "",
        bankAccountSortCode: "",
        bankAccountNumber: "",
        paymentStatus:'',
        uservip:''
        
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
    this.handleChange = this.handleChange.bind(this);
    this._handleModuleChange = this._handleModuleChange.bind(this);
    this._handleChangePassword = this._handleChangePassword.bind(this);
    this._handleSendEmail = this._handleSendEmail.bind(this);
    this.updateAdminAccount = this.updateAdminAccount.bind(this);
    this.createNewAccount = this.createNewAccount.bind(this);

    document.title = "Manage User Accounts";
    document.body.classList.remove('login-body');
  }
  componentDidMount() {
    const accountid = this.props.match.params.id;

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
    this.setState({
      isLoading: true
    });
    if (accountid) {
      
      this.getAccountRow(accountid);
    }

  }

  getAccountRow(accountid){
    fetch('/api/user/getaccountby_id?login_id=' + accountid)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            const userRow = json.result;
           
            userRow.password = '';
            this.setState({
              editAction: true,
              
              accountData: userRow
            });
          }else{
            toastr.error("Account doesn't exists", 'Error!');
          this.setState({
            
            redirectPage: true
          });
          }
        });
  }
  _formValidation(fieldsToValidate = [], callback = () => { }) {
    const { accountData } = this.state;
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
      }, accountPhone: {
        message: "Please enter the phone number.",
        doValidate: () => {
          const value = _.get(accountData, 'accountPhone', '');

          if (value && value.length > 0) {
            return true;
          }
          return false;
        }
      }, accountCountry: {
        message: "Please select the country.",
        doValidate: () => {
          const value = _.get(accountData, 'accountCountry', '');
          if (value && value.length > 0) {
            return true;
          }
          return false;
        }
      }, accountReferrence: {
        message: "Please select where did you hear about us?",
        doValidate: () => {
          const value = _.get(accountData, 'accountReferrence', '');
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
    const { editAction, passChecked } = this.state;
    event.preventDefault();
    let fieldNeedToValidate = [];
    if (editAction) {
      if (passChecked) {
        fieldNeedToValidate = ['name', 'username', 'email', 'password', 'cpassword', 'accountPhone', 'accountCountry','accountReferrence'];
      } else {
        fieldNeedToValidate = ['name', 'username', 'email', 'accountPhone', 'accountCountry','accountReferrence'];
      }
    } else {
      fieldNeedToValidate = ['name', 'username', 'email', 'password', 'cpassword', 'accountPhone', 'accountCountry','accountReferrence'];

    }


    this._formValidation(fieldNeedToValidate, (isValid) => {
      if (isValid) {

        

        this.setState({ diableBtn: true });
        if (editAction) {
          this.updateAdminAccount();
        } else {
          this.createNewAccount();
        }

      } else {
      }
    });
  }
  updateAdminAccount() {
    const { accountData, emailChecked, passChecked } = this.state;
    fetch('/api/user/update-accounts',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          accountData: accountData,
          emailChecked: emailChecked,
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
            redirectPage: true
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
  createNewAccount() {
    const { accountData, checked } = this.state;
    fetch('/api/user/create',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          accountData: accountData,
          sendMail: checked,
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
            redirectPage: true
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
    let errors = this.state.errors;
    const fieldName = e.target.name;
    let fieldNeedToValidate = [fieldName];
    errors[fieldName] = null;
    this._formValidation(fieldNeedToValidate, () => {
    });

  }
  _handleChange(e) {
    var checked = e.target.checked;
    this.setState({ checked: checked });

  }
  _handleChangePassword(e) {
    var checked = e.target.checked;
    let errors = this.state.errors;
    this.setState({ passChecked: checked });
    errors['password'] = null;
    errors['cpassword'] = null;
  }
  _handleSendEmail(e) {
    var checked = e.target.checked;
    this.setState({ emailChecked: checked });

  }

  handleChange(event) {
    let { accountData } = this.state;
    let errors = this.state.errors;
    errors['accessPrivilege'] = null;
    accountData['accessPrivilege'] = event.target.value;
    this.setState({
      accountData: accountData
    });

  };

  _handleModuleChange(event) {
    let { accountData } = this.state;
    let errors = this.state.errors;
    errors['accessModule'] = null;
    accountData['accessModule'] = event.target.value;
    this.setState({
      accountData: accountData
    });
  };

  updateAccount(action, id) {
    let doActions = true;
    if (action == 'Delete' && !window.confirm('Are you sure you wish to delete this item?')) {
      doActions = false;
    }
    if (doActions) {
      toastr.clear();
      fetch('/api/user/updateadmin_accounts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: action,
          _id: id
        })
      }).then(res => res.json())
        .then(json => {
          if (json.success) {
            toastr.success(json.message, '');
            this.getAccountRow(id);
          } else {
            toastr.error(json.message, 'Error!');
          }
        });
    }



  }

  _onSelectCountryChange(e) {
    let { accountData } = this.state;
    accountData['accountCountry '] = e.target.value;
    this.setState({ accountData: accountData});
  }

  render() {
    const { logout, accountData, error, pageTitle, checked, redirectPage,
      editAction, passChecked, emailChecked } = this.state;
    let passContent = '';
    let actionBtns = '';
    if (redirectPage) {
      return (
        <>
          <Redirect to='/user-accounts' />
        </>

      );
    }

    var thisObj = this;
    let disabled, enabled, tooltipEn, tooltipDe;
    var accountStatus;
    if (accountData.block == 0) {
      accountStatus = <label className="label label-status label-success">Enabled</label>
      disabled = '';
      enabled = "disabled";
      tooltipEn = '';
      tooltipDe = 'Disable';
    } else {
      accountStatus = <label className="label label-status label-warning">Disabled</label>
      disabled = 'disabled';
      enabled = '';
      tooltipEn = 'Enable';
      tooltipDe = '';
    }

     

    const editActionCheckbox = editAction ? <>
      <FormControlLabel control={
        <Checkbox
          checked={passChecked}
          value="1"
          color="primary"
          onChange={this._handleChangePassword}
        />} label="Change Password?" />
    </> : <>
        <FormControlLabel control={
          <Checkbox
            checked={checked}
            value="1"
            color="primary"
            onChange={this._handleChange}
          />} label="Send account details to this E-mail ID?" />
      </>;
    if (editAction) {
      passContent = passChecked ? <>
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
        <div className="col-xs-12">
          <div className="form-group">
            <FormControlLabel control={
              <Checkbox
                checked={emailChecked}
                value="1"
                color="primary"
                onChange={this._handleSendEmail}
              />} label="Send password details to this E-mail ID?" />

          </div>
        </div>
      </> : null;

      actionBtns = <> <div class="add-link">
      <button type="button" data-tip={tooltipEn} onClick={thisObj.updateAccount.bind(thisObj, 'enable', accountData._id)} className="btn action-btn-common btn-enable" disabled={enabled}>&nbsp;</button>&nbsp;
      <button type="button" data-tip={tooltipDe} onClick={thisObj.updateAccount.bind(thisObj, 'disable', accountData._id)} className="btn action-btn-common btn-disable" disabled={disabled}>&nbsp;</button>&nbsp;
            
      <Link type="button" data-tip='View' to={`/user/manager/view/${accountData._id}`} className="btn action-btn-common btn-view">&nbsp;</Link>&nbsp;
      <ReactTooltip />
      </div></>
    } else {
      passContent = <>
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
      </>;
    }
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
                      <li><a>User Accounts</a></li>
                      <li><NavLink to="/user-accounts">Accounts List</NavLink></li>
                      <li><a className="active">Manage User Accounts</a></li>
                    </ul>
                    {actionBtns}
                  </div>
                 
                    <form onSubmit={this._onSubmit}>
                    <div className="white-box">
                    <h4>Account Info </h4>
                    
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
                            <FormControl fullWidth error={_.get(error, 'last_name')} aria-describedby="last_name-error-text" >
                              <InputLabel htmlFor="last_name-id">Last Name</InputLabel>
                              <Input type="text" id="last_name-id" name="last_name" value={accountData.last_name} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="last_name-error-text">{_.get(error, 'last_name')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'username')} aria-describedby="username-error-text" >
                              <InputLabel htmlFor="username-id">Username</InputLabel>
                              <Input type="text" id="username-id" name="username" value={accountData.username} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="username-error-text">{_.get(error, 'username')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>

                        
                        
                         </div>
                        <div className="row">
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
                            {editActionCheckbox}
                          </div>
                        </div>
                        {passContent}
                      </div>
                      
 <div className="row">
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'accountPhone')} aria-describedby="name-error-text" >
                              <InputLabel htmlFor="name-simple">Phone Number</InputLabel>
                              <Input id="name-simple" name="accountPhone" value={accountData.accountPhone} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'accountPhone')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                          <FormControl fullWidth error={_.get(error, 'accountCountry')}>
                            <InputLabel htmlFor="accountCountry">Country </InputLabel>
                            <Select
                              value={accountData.accountCountry}
                              onChange={this._onTextFieldChange}
                              inputProps={{
                                name: 'accountCountry',
                                id: 'accountCountry',
                              }}
                            >


                            {getCountries().map(country => (
                                 <MenuItem value={country.code}>{country.name}</MenuItem>
                              ))}
                            
                          
                            </Select>
                            <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'accountCountry')}</FormHelperText>
                          </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                          <FormControl fullWidth error={_.get(error, 'accountReferrence')}>
                            <InputLabel htmlFor="accountReferrence">Where did you hear about us? </InputLabel>
                            <Select
                              value={accountData.accountReferrence}
                              onChange={this._onTextFieldChange}
                              inputProps={{
                                name: 'accountReferrence',
                                id: 'accountReferrence',
                              }}
                            >


                            {hearAboutUs().map(aboutus => (
                                 <MenuItem value={aboutus.code}>{aboutus.name}</MenuItem>
                              ))}
                            
                          
                            </Select>
                            <FormHelperText className="errtext" id="name-error-text">{_.get(error, 'accountReferrence')}</FormHelperText>
                          </FormControl>
                          </div>
                        </div>

                        
                        
                         </div>


</div>
<div class="white-box mt-20">

                              <h4>Payment Details</h4>
                              <div className="row">
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'accountSkrillEmail')} aria-describedby="accountSkrillEmail-error-text" >
                              <InputLabel htmlFor="accountSkrillEmail-simple">Skrill email address</InputLabel>
                              <Input id="accountSkrillEmail-simple" name="accountSkrillEmail" value={accountData.accountSkrillEmail} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="accountSkrillEmail-error-text">{_.get(error, 'accountSkrillEmail')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'accountNetellerEmail')} aria-describedby="accountNetellerEmail-error-text" >
                              <InputLabel htmlFor="accountNetellerEmail-id">Netller email address</InputLabel>
                              <Input type="text" id="accountNetellerEmail-id" name="accountNetellerEmail" value={accountData.accountNetellerEmail} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="accountNetellerEmail-error-text">{_.get(error, 'accountNetellerEmail')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'accountPaypalEmail')} aria-describedby="accountPaypalEmail-error-text" >
                              <InputLabel htmlFor="accountPaypalEmail-id">PayPal email address</InputLabel>
                              <Input type="text" id="accountPaypalEmail-id" name="accountPaypalEmail" value={accountData.accountPaypalEmail} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                            
                              <FormHelperText className="errtext" id="accountPaypalEmail-error-text">{_.get(error, 'accountPaypalEmail')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>

                        
                        
                         </div></div>
                         <div class="white-box mt-20">
                         <h4>Payout by bank transfer - BACS </h4>
                          <div className="row">
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'bankAccountName')} aria-describedby="bankAccountName-error-text" >
                              <InputLabel htmlFor="bankAccountName-simple">Account Holder Name</InputLabel>
                              <Input id="bankAccountName-simple" name="bankAccountName" value={accountData.bankAccountName} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="bankAccountName-error-text">{_.get(error, 'bankAccountName')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'bankAccountSortCode')} aria-describedby="bankAccountSortCode-error-text" >
                              <InputLabel htmlFor="bankAccountSortCode-id">Sort code</InputLabel>
                             
                              <Input   id="bankAccountSortCode-simple" name="bankAccountSortCode" value={accountData.bankAccountSortCode} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} /> 
                                    
                             
                              
                              
                             
                              <FormHelperText className="errtext" id="bankAccountSortCode-error-text">{_.get(error, 'bankAccountSortCode')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-4 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'bankAccountNumber')} aria-describedby="bankAccountNumber-error-text" >
                              <InputLabel htmlFor="bankAccountNumber-id">Account Number</InputLabel>
                              <Input type="text" id="bankAccountNumber-id" name="bankAccountNumber" value={accountData.bankAccountNumber} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="bankAccountNumber-error-text">{_.get(error, 'bankAccountNumber')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>

                        
                        
                         </div></div>
                         <div class="white-box mt-20">
                         <div className="row">
                         <div class="ad-form col-lg-4 col-sm-6">
                       
                          <FormControl fullWidth>
                            <InputLabel htmlFor="paymentStatus">Sharbs Software</InputLabel>
                            <Select
                              value={accountData.paymentStatus}
                              onChange={this._onTextFieldChange}
                              inputProps={{
                                name: 'paymentStatus',
                                id: 'paymentStatus',
                              }}
                            >

                              <MenuItem value={1}>Active</MenuItem>
                              <MenuItem value={0}>InActive</MenuItem>
                             
                            </Select>
                          </FormControl>
                        
                      </div>

                      <div class="ad-form col-lg-4 col-sm-6">
                       
                       <FormControl fullWidth>
                         <InputLabel htmlFor="uservip">VIP User</InputLabel>
                         <Select
                           value={accountData.uservip}
                           onChange={this._onTextFieldChange}
                           inputProps={{
                             name: 'uservip',
                             id: 'uservip',
                           }}
                         >

                           <MenuItem value={1}>Active</MenuItem>
                           <MenuItem value={0}>InActive</MenuItem>
                          
                         </Select>
                       </FormControl>
                     
                   </div>

                         </div>
                         <div className="row">&nbsp;
                         </div>
                      <button type="submit" className="bnt ad-cmn-btn btn-submit">Submit</button>
                      </div>
                    </form>
                  
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

export default UserManager;
