import React, { Component } from 'react';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import 'whatwg-fetch';
import toastr from 'toastr'
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { Icon } from 'react-icons-kit'
import { search } from 'react-icons-kit/fa/search';
import { dashboard } from 'react-icons-kit/fa/dashboard';
import ReactLoading from 'react-loading';
import ReactTooltip from 'react-tooltip';
import Pagination from "react-js-pagination";
const config = require('../../../../config/config');
import Loader from 'react-loader-spinner'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Moment from 'react-moment';
import MenuItem from '@material-ui/core/MenuItem';

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
class UserTurnoverReg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' User Accounts',
      norecords: false,
      arrayList: '',
      isLoading: false,
      listPerPage: 20,
      showLoading: false,
      logout: false,
      activePage: 1,
      totalRecords: 0,
      pageLimit: config.limit,
      sortClass: 'fa-sort',
      sortOrder: 'desc',
      sortKey: 'registrationAdded',
      searchData: {
        searchKey: '',
        searchBy: '',
        accountStatus: ''
      }

    };
    document.title = "User Turnover Registration Request List";
    document.body.classList.remove('login-body');
    this.loadUserTurnoverReq = this.loadUserTurnoverReq.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
    this._onTextFieldChange = this._onTextFieldChange.bind(this);
    this._onSelectPageCountChange = this._onSelectPageCountChange.bind(this);
    document.body.classList.remove('search-slide');

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
    fetch('/api/user/turnover_req_count').then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            totalRecords: json.totalCount,
          });
        }
      });
    const { activePage } = this.state;
    this.setState({
      isLoading: true
    });
    this.loadUserTurnoverReq(activePage);
  }

  loadUserTurnoverReq(activePage) {
   const { searchData, pageLimit,sortKey, sortOrder } = this.state;
    fetch('/api/user/turnover_req', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        activePage: activePage,
        pageLimit: pageLimit,
        sortKey: sortKey,
        sortOrder: sortOrder,
        searchData: searchData
      })
    }).then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            arrayList: json.records,
            isLoading: false,
            norecords: false,
          });

        } else {
          this.setState({
            arrayList: '',
            norecords: true,
            isLoading: false
          });
        }
      });
  }

  updateAccount(action, id, e) {
    const { activePage } = this.state;
    let doActions = true;
    if (!window.confirm('Are you sure you wish to '+action+' this account?')) {
      doActions = false;
    }
    if (doActions) {
      this.setState({
        showLoading: true,
      });
      toastr.clear();
      fetch('/api/user/updateturnover_req', {
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
            this.loadUserTurnoverReq(activePage);
            this.setState({
              showLoading: false,
              isLoading: false
            });
          } else {
            toastr.error(json.message, 'Error!');
            this.setState({
              showLoading: false,
              isLoading: false
            });
          }
        });
    }

  }
  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
    this.loadUserTurnoverReq(pageNumber);
  }
  handleSort(sortKey, sortOrder, e) {
    sortOrder = (sortOrder == 'desc') ? 'asc' : 'desc';
    let sortClass = (sortOrder == 'desc') ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up';


    setTimeout(() => {
      this.setState({ sortClass: sortClass, sortOrder: sortOrder, sortKey: sortKey });
      this.loadUserTurnoverReq(1);
    }, 100);

  }
  toggleSearchBox() {
    let { searchData } = this.state;
    $('body').toggleClass('search-slide');
    if (!$('body').hasClass('search-slide')) {
      searchData['searchKey'] = '';
      searchData['searchBy'] = '';
      searchData['accountStatus'] = '';
      this.setState({
        searchData: searchData
      });
      this.loadUserTurnoverReq(1);
    }
  }

  _onTextFieldChange(e) {

    let { searchData } = this.state;
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    searchData[fieldName] = fieldValue;
    this.setState({ searchData: searchData });
  }
  _onSelectPageCountChange(e) {
    let { listPerPage, pageLimit } = this.state;
    setTimeout(() => {
      this.setState({ listPerPage: e.target.value, pageLimit: e.target.value, });
      this.loadUserTurnoverReq(1);
    }, 100);


  }
  searchSubmit(event) {
    event.preventDefault();
    this.loadUserTurnoverReq(1);
  }
  render() {
    const { logout, passval, arrayList, showLoading, pageTitle, sortClass, sortOrder, sortKey, searchData, listPerPage, pageLimit, isLoading, norecords, totalRecords } = this.state;

    var arr = [];
    var thisObj = this;
    Object.keys(arrayList).forEach(function (key) {
      arr.push(arrayList[key]);
    });
    var accountList = '';
    var loading = showLoading ? <><div class="head-load"><span>Loading...</span></div></> : null;
    if (isLoading) {
      accountList = <tr><td colSpan="8" align="center">
        <Loader type="Oval" color="#aaa" height="" width="30" />
      </td></tr>;
    } else {
      if (norecords) {
        accountList = <tr><td colSpan="8" align="center">No records found.</td></tr>;
      } else {
        var sNo = (config.limit * (this.state.activePage - 1)) + 1;
        accountList = arr.map(function (accounts, index) {
          let accountStatus;
          let disabled, enabled, tooltipEn, tooltipDe;
          let id = accounts._id.toString();
          let showActionBtns = null;
          if (accounts.registrationApproved == 0) {
            showActionBtns = <><button type="button" data-tip="Approve" onClick={thisObj.updateAccount.bind(thisObj, 'approve', id)} className="btn action-btn-common btn-approve" >&nbsp;</button>&nbsp;
            <button type="button" data-tip="Decline" onClick={thisObj.updateAccount.bind(thisObj, 'decline', id)} className="btn action-btn-common btn-unapprove">&nbsp;</button>&nbsp;</>;
            accountStatus = <label className="label label-status label-warning">Awaiting</label>
            
          } else if (accounts.registrationApproved == 1) {
            accountStatus = <label className="label label-status label-danger">Declined</label>
            
          } else {
            accountStatus = <label className="label label-status label-success">Approved</label>
          }

          return <tr>

            <td>{index + sNo}</td>
            <td>{accounts.registrationType}

              <FormHelperText className="usr-info-text">{accounts.customer_type == 1 ? 'New Customer' : 'Existing Customer'}</FormHelperText></td>
            <td>{accounts.registrationAccountName}</td>
            <td>{accounts.registrationAccountEmail}</td>
            <td>{accounts.registrationAccountId}
              <FormHelperText className="usr-info-text">{accounts.registrationCurrency}</FormHelperText>
            </td>
            <td> </td>
            <td> </td>
            <td><Moment unix format="DD/MM/YYYY HH:MM">{accounts.registrationAdded / 1000}</Moment></td>
            <td>{accountStatus} </td>
            <td>
               
              {showActionBtns}
              <button type="button" data-tip='Delete' onClick={thisObj.updateAccount.bind(thisObj, 'Delete', id)} className="btn action-btn-common btn-delete">&nbsp;</button>
              <ReactTooltip />
            </td>
          </tr>;

        });
      }
    }



    if (!logout) {
      return (
        <>

          <div className="ad-wrapper">
            <Navbar />
            <div className="inner-wrapper">
            {loading}
              <Header pageTitle={pageTitle} />
              <div className="page-wrapper">
                <div className="container-fluid">
                  <div className="brd-srch-links">
                    <ul className="bread-crumb">
                      <li><NavLink to="/dashboard"><i className={`fa fa-home`} ></i> Dashboard</NavLink></li>
                      <li><a> User Accounts</a></li>
                      <li><a className="active">Turnover Registration Request List</a></li>
                    </ul>
                    <div className="add-link">


                      <Button data-tip='Search' mini onClick={thisObj.toggleSearchBox.bind(thisObj)} variant="contained" color="secondary" aria-label="Add">
                        <Icon icon={search} />
                      </Button>&nbsp;


                      <ReactTooltip />

                      <div class="ad-form list-cunt-dd">
                        <div class="select-box">
                          <FormControl fullWidth className="selectbox-main">

                            <Select
                              value={listPerPage}
                              className="selectbox-manual"
                              onChange={this._onSelectPageCountChange}
                              inputProps={{
                                name: 'listPerPage',
                                id: 'listPerPage',
                              }}
                            >

                              <MenuItem value={20}>20</MenuItem>
                              <MenuItem value={40}>40</MenuItem>
                              <MenuItem value={60}>60</MenuItem>
                              <MenuItem value={80}>80</MenuItem>
                              <MenuItem value={100}>100</MenuItem>
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="white-box searchbox">
                    <span className="srch-res"><a href="javascript:void(0);" className="s-link"><img src="/assets/images/menu-close.svg" alt="menu" /></a></span>
                    <div className="search-box-wrap">
                      <form onSubmit={this.searchSubmit}>
                        <div className="row">
                          <div className="ad-form col-sm-12">
                            <div className="form-group search-box">

                              <FormControl fullWidth aria-describedby="name-error-text" >
                                <InputLabel htmlFor="searchKey">Search Key</InputLabel>
                                <Input id="name-simple" name="searchKey" value={searchData.searchKey} onChange={this._onTextFieldChange} />

                              </FormControl>
                            </div>
                          </div>
                          <div className="ad-form col-sm-12">
                            <div className="form-group search-box">

                              <FormControl fullWidth>
                                <InputLabel htmlFor="searchBy">Search By</InputLabel>
                                <Select
                                  value={searchData.searchBy}
                                  onChange={this._onTextFieldChange}
                                  inputProps={{
                                    name: 'searchBy',
                                    id: 'searchBy',
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  <MenuItem value="registrationType">Scheme</MenuItem>
                                  <MenuItem value="registrationAccountEmail">Email</MenuItem>
                                  <MenuItem value="registrationAccountName">Name</MenuItem>
                                  <MenuItem value="registrationAccountId">Account Id</MenuItem>
                                  <MenuItem value="registrationCurrency">Currency</MenuItem>


                                </Select>
                              </FormControl>
                            </div>
                          </div>

                        </div>
                        <button type="submit" className="bnt ad-cmn-btn btn-submit">Search</button>&nbsp;
                        <button type="button" onClick={thisObj.toggleSearchBox.bind(thisObj)} className="bnt ad-cmn-btn btn-cancel">Cancel</button>
                      </form>
                    </div>
                  </div>
                  <div className="white-box mt-20 p-0">
                    <div className="table-responsive">
                      <table className="table center-aligned-table">
                        <thead>
                          <tr className="bg-light">

                            <th className="border-bottom-0">#</th>
                            <th onClick={thisObj.handleSort.bind(thisObj, 'registrationType', sortOrder)} className="border-bottom-0 sort">Scheme <i className={`fa ${(sortKey == "registrationType") ? sortClass : "fa-sort"}`}></i></th>
                            <th onClick={thisObj.handleSort.bind(thisObj, 'registrationAccountName', sortOrder)} className="border-bottom-0 sort"> Name <i className={`fa ${(sortKey == "registrationAccountName") ? sortClass : "fa-sort"}`}></i></th>
                            <th onClick={thisObj.handleSort.bind(thisObj, 'registrationAccountEmail', sortOrder)} className="border-bottom-0 sort">Email <i className={`fa ${(sortKey == "registrationAccountEmail") ? sortClass : "fa-sort"}`}></i></th>
                            <th onClick={thisObj.handleSort.bind(thisObj, 'registrationAccountId', sortOrder)} className="border-bottom-0 sort">Account Id <i className={`fa ${(sortKey == "registrationAccountId") ? sortClass : "fa-sort"}`}></i></th>
                            <th  className="border-bottom-0 sort">CouponArb Username </th>
                            <th  className="border-bottom-0 sort">Registered On </th>
                            <th onClick={thisObj.handleSort.bind(thisObj, 'registrationAdded', sortOrder)} className="border-bottom-0 sort">Created <i className={`fa ${(sortKey == "registrationAdded") ? sortClass : "fa-sort"}`}></i></th>
                            <th className="border-bottom-0 sort">Status </th>
                            <th className="border-bottom-0">Action</th>
                          </tr>
                        </thead>
                        <tbody>


                          {accountList}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="sel-actions">

                    <Pagination
                      activePage={this.state.activePage}
                      itemsCountPerPage={pageLimit}
                      totalItemsCount={totalRecords}
                      pageRangeDisplayed={5}
                      onChange={this.handlePageChange}
                    />
                  </div>

                </div>



              </div>

            </div>
          </div>
          <ReactTooltip />
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


export default UserTurnoverReg;
