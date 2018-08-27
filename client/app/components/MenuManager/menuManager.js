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
class menuManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' Menu Manager',
      pageSubTitle: ' Manage Menu',
      arrayList: '',
      isLoading: false,
      logout: false,
      checked: true,
      passChecked: false,
      emailChecked: true,
      redirectPage: false,
      editAction: false,
      formData: {
        _id: '',
        title: '',
        menutype: 'footer',
        description: ''
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
    this.createNewMenu = this.createNewMenu.bind(this);
    this.updateMenus = this.updateMenus.bind(this);
   

    document.title = "Manage Menus";
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
      this.getMenuRow(accountid);
    }
  }

  getMenuRow(accountid) {
    fetch('/api/menumanger/menusrow_byid?login_id=' + accountid)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const userRow = json.result;
          this.setState({
            editAction: true,
            formData: {
              _id: userRow._id,
              title: userRow.title,
              menutype: userRow.menutype,
              description: userRow.description,

            },
          });
        } else {
          toastr.error("Invalid URI", 'Error!');
          this.setState({
            redirectPage: true
          });
        }
      });
  }

 


  _formValidation(fieldsToValidate = [], callback = () => { }) {
    const { formData } = this.state;
    const allFields = {
      title: {
        message: "Please enter menu title.",
        doValidate: () => {
          const value = _.trim(_.get(formData, 'title', ""));
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
    fieldNeedToValidate = ['title'];
    this._formValidation(fieldNeedToValidate, (isValid) => {
      if (isValid) {
        this.setState({ diableBtn: true });
        if (editAction) {
          this.updateMenus();
        } else {
          this.createNewMenu();
        }

      } else {
      }
    });
  }
  updateMenus() {
    const { formData, emailChecked, passChecked } = this.state;
    fetch('/api/menumanger/updatemenu',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          formData: formData,

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
  createNewMenu() {
    const { formData, checked } = this.state;
    fetch('/api/menumanger/create',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          formData: formData,
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
    let { formData } = this.state;
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    formData[fieldName] = fieldValue;
    errors[fieldName] = null;
    this.setState({ formData: formData });
  }
  _onTextFieldBlur(e) {
    let errors = this.state.errors;
    const fieldName = e.target.name;
    let fieldNeedToValidate = [fieldName];
    errors[fieldName] = null;
    this._formValidation(fieldNeedToValidate, () => {
    });
  }
  render() {
    const { logout, formData, error, pageTitle, redirectPage
    } = this.state;
    let passContent = '';
    if (redirectPage) {
      return (
        <>
          <Redirect to='/menus' />
        </>

      );
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
                      <li><a>Menu Manager</a></li>
                      <li><NavLink to="/menus">Menu List</NavLink></li>
                      <li><a className="active">Manage Menu</a></li>
                    </ul>
                  </div>
                  <form onSubmit={this._onSubmit}>
                    <div className="white-box">
                      <h4>Menu Info </h4>
                      <div className="row">
                        <div className="ad-form col-lg-3 col-sm-6">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'title')} aria-describedby="title-error-text" >
                              <InputLabel htmlFor="title-simple">Title</InputLabel>
                              <Input id="title-simple" name="title" value={formData.title} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="title-error-text">{_.get(error, 'title')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                        <div className="ad-form col-lg-8 col-sm-8">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'description')} aria-describedby="description-error-text" >
                              <InputLabel htmlFor="description-simple">Description</InputLabel>
                              <Input id="description-simple" name="description" value={formData.description} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="description-error-text">{_.get(error, 'description')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div class="ad-form col-lg-4 col-sm-6">
                          <FormControl fullWidth>
                            <InputLabel htmlFor="paymentStatus">Menu Type</InputLabel>
                            <Select
                              value={formData.menutype}
                              onChange={this._onTextFieldChange}
                              inputProps={{
                                name: 'menutype',
                                id: 'menutype',
                              }}
                            >
                              <MenuItem value="footer">Footer</MenuItem>
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

export default menuManager;
