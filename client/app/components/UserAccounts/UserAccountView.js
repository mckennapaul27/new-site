import React, { Component } from 'react';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import 'whatwg-fetch';
import toastr from 'toastr'
import ReactTooltip from 'react-tooltip';
import Divider from '@material-ui/core/Divider';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  Switch,
  Redirect
} from 'react-router-dom'
import {
  getFromStorage,
  getAdminModules,
  getCountries,
  hearAboutUs
} from '../../utills/common';
const names = [
  'VIEW',
  'UPDATE',
  'INSERT',
  'DELETE',

];
class UserAccountView extends Component {
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
      accountData: [],
      errors: {
        username: null,
        password: null
      }
    };

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
            console.log('accountData.accessPrivilege', userRow.accessPrivilege);

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

  updateAccount(action, id, e) {
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



  render() {
    const { logout, accountData, error, diableBtn, passval, pageTitle, arrayList, isLoading, checked, redirectPage,
      editAction, passChecked, emailChecked } = this.state;
    let accessModule, accessPrivilege = '';


    if (redirectPage) {
      return (
        <>
          <Redirect to='/user-accounts' />
        </>

      );
    }
    var thisObj = this;
    let accountStatus;
    let disabled, enabled, tooltipEn, tooltipDe;
    
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
    accessModule = (accountData.accessModule) ? accountData.accessModule.join(',') : '';
    accessPrivilege = (accountData.accessPrivilege) ? accountData.accessPrivilege.join(',') : '';
    console.log('accessModule', accessModule);
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
                      <li><a className="active">View User Accounts</a></li>
                    </ul>
                    <div class="add-link">
                    <button type="button" data-tip={tooltipEn} onClick={thisObj.updateAccount.bind(thisObj, 'enable', accountData._id)} className="btn action-btn-common btn-enable" disabled={enabled}>&nbsp;</button>&nbsp;
            <button type="button" data-tip={tooltipDe} onClick={thisObj.updateAccount.bind(thisObj, 'disable', accountData._id)} className="btn action-btn-common btn-disable" disabled={disabled}>&nbsp;</button>&nbsp;
            
                      <Link data-tip='Edit' to={`/user/manager/${accountData._id}`} className="btn action-btn-common btn-edit">&nbsp;</Link>&nbsp;
                      <ReactTooltip />
                    </div>
                  </div>
                  <div className="white-box">

                    <h4>Account Info</h4>
                    <Divider />
                    <p></p>
                    <div class="row">
                      <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Name</label>
                          <p>{accountData.name}</p>
                        </div>
                      </div>
                      <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Last Name</label>
                          <p>{accountData.last_name}</p>
                        </div>
                      </div>
                      <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Username</label>
                          <p>{accountData.username}</p>
                        </div>
                      </div>
                     
                    </div>

                    <div class="row">
                    <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Email</label>
                          <p>{accountData.email}</p>
                        </div>
                      </div>
                      <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Phone Number</label>
                          <p>{accountData.accountPhone}</p>
                        </div>
                      </div>
                      <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Country</label>
                          <p>
                          {getCountries().map(country => (
                            country.code == accountData.accountCountry?country.name:''
                                
                              ))}
                          </p>
                        </div>
                      </div>
                      <div class="ad-form col-lg-4 col-sm-6">
                        <div class="form-group">
                          <label>Where did you hear about us?</label>
                          <p> {hearAboutUs().map(aboutus => (
                            aboutus.code == accountData.accountReferrence?aboutus.name:''
                                
                              ))}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                  <div class="white-box mt-20">
                    <h4>Payment Details</h4>
                    <Divider />
                    <p></p>
                    <div class="row">
                      <div class="ad-form col-sm-6">

                        <label>Skrill email address</label>
                        <p>{accountData.accountSkrillEmail?accountData.accountSkrillEmail:'-'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                        <label>Neteller email address</label>
                        <p>{accountData.accountNetellerEmail?accountData.accountNetellerEmail:'-'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                      <label>PayPal email address</label>
                      <p>{accountData.accountPaypalEmail?accountData.accountPaypalEmail:'-'}</p>
                      </div>
                    </div>
                  </div>

                  <div class="white-box mt-20">
                    <h4>Payout by bank transfer - BACS </h4>
                    <Divider />
                    <p></p>
                    <div class="row">
                      <div class="ad-form col-sm-6">

                        <label>Account Holder Name</label>
                        <p>{accountData.bankAccountName?accountData.bankAccountName:'-'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                        <label>Sort code</label>
                        <p>{accountData.bankAccountSortCode?accountData.bankAccountSortCode:'-'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                      <label>Account Number</label>
                      <p>{accountData.bankAccountNumber?accountData.bankAccountNumber:'-'}</p>
                      </div>
                    </div>
                  </div>
                  <div class="white-box mt-20">
                    <h4>Others </h4>
                    <Divider />
                    <p></p>
                    <div class="row">
                      <div class="ad-form col-sm-6">

                        <label>Sharbs Software</label>
                        <p>{accountData.paymentStatus?'Active':'In Active'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                        <label>VIP User</label>
                        <p>{accountData.uservip?'Active':'In Active'}</p>
                      </div>
                     
                    </div>
                  </div>

                  <div class="white-box mt-20">
                    <h4>Account Access Info</h4>
                    <Divider />
                    <p></p>
                    <div class="row">
                      <div class="ad-form col-sm-6">

                        <label>Last Login Time</label>
                        <p>{accountData.accountLatestLoginTime?accountData.accountLatestLoginTime:'Never'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                        <label>Login Count</label>
                        <p>{accountData.accountLoginCount?accountData.accountLoginCount:'Never'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                        <label>Last Login User Agent</label>
                        <p>{accountData.accountLatestLoginUA?accountData.accountLatestLoginUA:'Never'}</p>
                      </div>
                      <div class="ad-form col-sm-6">

                        <label>Last Login Ip </label>
                        <p>{accountData.accountLatestLoginIP?accountData.accountLatestLoginIP:'Never'}</p>
                      </div>
                    </div>
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


export default UserAccountView;
