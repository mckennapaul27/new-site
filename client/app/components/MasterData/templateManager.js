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
import TinyMCE from 'react-tinymce';

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
class templateManager extends Component {
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
        template_subject: '',
        template_content: '',


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
    this.updateEmailTemplates = this.updateEmailTemplates.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);

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

      this.getEmailRow(accountid);
    }

  }

  getEmailRow(accountid) {
    fetch('/api/masterdata/emailtemprow_byid?login_id=' + accountid)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const userRow = json.result;
     
          this.setState({
            editAction: true,
            accountData: {
              _id: userRow._id,
              template_subject: userRow.template_subject,
              template_content: userRow.template_content,
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
    const { accountData } = this.state;
    const allFields = {
      template_subject: {
        message: "Please enter the  subject.",
        doValidate: () => {
          const value = _.trim(_.get(accountData, 'template_subject', ""));
          if (value.length > 0) {
            return true;
          }
          return false;
        }
      },
      template_content: {
        message: "Please enter the template content.",
        doValidate: () => {
          const value = _.trim(_.get(accountData, 'template_content', ""));
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
    fieldNeedToValidate = ['template_subject', 'template_content'];


    this._formValidation(fieldNeedToValidate, (isValid) => {
      if (isValid) {
        this.setState({ diableBtn: true });
        this.updateEmailTemplates();

      } else {
      }
    });
  }
  updateEmailTemplates() {
    const { accountData, emailChecked, passChecked } = this.state;
    fetch('/api/masterdata/update-emailtemplates',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          accountData: accountData,

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


  
  handleEditorChange(e) {
    let { accountData } = this.state;
    accountData['template_content'] = e.target.getContent();

    this.setState({ accountData: accountData });
  }

  render() {
    const { logout, accountData, error, pageTitle, redirectPage
    } = this.state;
    let passContent = '';

    if (redirectPage) {
      return (
        <>
          <Redirect to='/masterdata/email-templates' />
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
                      <li><a>Master Data</a></li>
                      <li><NavLink to="/masterdata/email-templates">Email Templates</NavLink></li>
                      <li><a className="active">Manage Email Templates</a></li>
                    </ul>

                  </div>

                  <form onSubmit={this._onSubmit}>
                    <div className="white-box">
                      <h4>Template Info </h4>

                      <div className="row">
                        <div className="ad-form col-lg-8 col-sm-8">
                          <div className="form-group">
                            <FormControl fullWidth error={_.get(error, 'template_subject')} aria-describedby="template_subject-error-text" >
                              <InputLabel htmlFor="template_subject-simple">Name</InputLabel>
                              <Input id="template_subject-simple" name="template_subject" value={accountData.template_subject} onKeyUp={this._onTextFieldBlur} onBlur={this._onTextFieldBlur} onChange={this._onTextFieldChange} />
                              <FormHelperText className="errtext" id="template_subject-error-text">{_.get(error, 'template_subject')}</FormHelperText>
                            </FormControl>
                          </div>
                        </div>





                      </div>
                      <div className="row">
                        <div className="ad-form col-lg-12 col-sm-12">
                          <div className="form-group">
                            <TinyMCE
                              key={accountData.template_content} // Assign a key here
                              content={accountData.template_content}
                              config={{

                                plugins: [
                                  'advlist autolink lists link image charmap print preview anchor',
                                  'searchreplace visualblocks code fullscreen',
                                  'insertdatetime media table contextmenu paste code',
                                ].join(' '),
                                toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',

                                height: 400,
                              }}
                              onChange={this.handleEditorChange}
                            />
                          </div>
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

export default templateManager;
