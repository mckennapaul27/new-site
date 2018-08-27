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
class UserInterestedList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' User Accounts',
      norecords: false,
      arrayList: '',
      isLoading: false,
      listPerPage: 20,
      logout: false,
      activePage: 1,
      showLoading: false,
      totalRecords: 0,
      pageLimit: config.limit,
      sortClass: 'fa-sort',
      sortOrder: 'desc',
      sortKey: 'user_intrested_added',
      searchData: {
        searchKey: '',
        searchBy: '',
        accountStatus: ''
      }

    };
    document.title = "User Intrested  List";
    document.body.classList.remove('login-body');
    this.loadUserInterested = this.loadUserInterested.bind(this);
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
    fetch('/api/user/user_interested_count').then(res => res.json())
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
    this.loadUserInterested(activePage);
  }

  loadUserInterested(activePage) {
    const { searchData, pageLimit,sortKey, sortOrder } = this.state;
    fetch('/api/user/user_interested', {
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
    if (action == 'Delete' && !window.confirm('Are you sure you wish to delete this account?')) {
      doActions = false;
    }
    if (doActions) {
      toastr.clear();
      this.setState({
        showLoading: true,
      });
      fetch('/api/user/updateuser_interested', {
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
            this.loadUserInterested(activePage);
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
    this.loadUserInterested(pageNumber);
  }
  handleSort(sortKey, sortOrder, e) {
    sortOrder = (sortOrder == 'desc') ? 'asc' : 'desc';
    let sortClass = (sortOrder == 'desc') ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up';


    setTimeout(() => {
      this.setState({ sortClass: sortClass, sortOrder: sortOrder, sortKey: sortKey });
      this.loadUserInterested(1);
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
      this.loadUserInterested(1);
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
      this.loadUserInterested(1);
    }, 100);


  }
  searchSubmit(event) {
    event.preventDefault();
    this.loadUserInterested(1);
  }
  render() {
    const { logout, passval, arrayList, showLoading, sortClass, sortOrder, sortKey, pageTitle, searchData, listPerPage, pageLimit, isLoading, norecords, totalRecords } = this.state;

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
          let id = accounts._id.toString()


          return <tr>

            <td>{index + sNo}</td>
            <td>{accounts.user_intrested_name}</td>
            <td>{accounts.user_intrested_email}</td>

            <td><Moment unix format="DD/MM/YYYY HH:MM">{accounts.user_intrested_added / 1000}</Moment></td>

            <td>

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
                      <li><a className="active">User Intrested  List</a></li>
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
                                  <MenuItem value="user_intrested_name">Name</MenuItem>
                                  <MenuItem value="user_intrested_email">Email</MenuItem>


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
                            <th onClick={thisObj.handleSort.bind(thisObj, 'user_intrested_name', sortOrder)} className="border-bottom-0 sort">Name <i className={`fa ${(sortKey == "user_intrested_name") ? sortClass : "fa-sort"}`}></i></th>
                            <th onClick={thisObj.handleSort.bind(thisObj, 'user_intrested_email', sortOrder)} className="border-bottom-0 sort"> Email <i className={`fa ${(sortKey == "user_intrested_email") ? sortClass : "fa-sort"}`}></i></th>



                            <th className="border-bottom-0">Added</th>
                            <th className="border-bottom-0">Actions</th>
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


export default UserInterestedList;
