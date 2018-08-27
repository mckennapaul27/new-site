import React, { Component } from 'react';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import 'whatwg-fetch';
import toastr from 'toastr'
import Button from '@material-ui/core/Button';
import { Icon } from 'react-icons-kit'
import { search } from 'react-icons-kit/fa/search';
import { dashboard } from 'react-icons-kit/fa/dashboard';
import ReactTooltip from 'react-tooltip';
import Pagination from "react-js-pagination";
import Loader from 'react-loader-spinner'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
const config = require('../../../../config/config');
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
const options = {
  fieldSeparator: ',',
  quoteStrings: '"',
  decimalseparator: '.',
  showLabels: true,
  showTitle: false,
  title: '',
  useBom: true,
  useKeysAsHeaders: true,

};
class menuList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' Menu Manager',
      norecords: false,
      arrayList: '',
      isLoading: false,
      listPerPage: 20,
      logout: false,
      activePage: 1,
      totalRecords: 0,
      showLoading: false,
      pageLimit: config.limit,
      sortClass: 'fa-sort',
      sortOrder: 'desc',
      sortKey: 'title',
      searchData: {
        searchKey: '',
        searchBy: '',
        accountStatus: ''
      }
    };
    document.title = "Menu List";
    document.body.classList.remove('login-body');
    this.loadMenus = this.loadMenus.bind(this);
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
    fetch('/api/menumanger/menuscount').then(res => res.json())
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
    this.loadMenus(activePage);
  }

  loadMenus(activePage) {
     const { searchData, pageLimit,sortKey, sortOrder } = this.state;
    fetch('/api/menumanger/menus', {
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
  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
    this.loadMenus(pageNumber);
  }
  handleSort(sortKey, sortOrder, e) {
    sortOrder = (sortOrder == 'desc') ? 'asc' : 'desc';
    let sortClass = (sortOrder == 'desc') ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up';


    setTimeout(() => {
      this.setState({ sortClass: sortClass, sortOrder: sortOrder, sortKey: sortKey });
      this.loadMenus(1);
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
      this.loadMenus(1);
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
      this.loadMenus(1);
    }, 100);
  }
  searchSubmit(event) {
    event.preventDefault();
    this.loadMenus(1);
  }

  updateAccount(action, id, e) {
    const { activePage, showLoading } = this.state;
    let doActions = true;
    if (action == 'Delete' && !window.confirm('Are you sure you wish to delete this account?')) {
      doActions = false;
    }
    if (doActions) {
      this.setState({
        showLoading: true,
      });
      toastr.clear();
      fetch('/api/menumanger/updatemenus_status', {
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
            this.loadMenus(activePage);
            this.setState({
              showLoading: false,
              isLoading: false
            });
          } else {
            this.setState({
              showLoading: false,
              isLoading: false
            });
            toastr.error(json.message, 'Error!');
          }
        });
    }

  }

  render() {
    const { logout, passval, arrayList, pageTitle,sortClass, sortOrder, sortKey, showLoading, searchData, listPerPage, pageLimit, isLoading, norecords, totalRecords } = this.state;
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
          let id = accounts._id.toString()
          let accountStatus;
          let disabled, enabled, tooltipEn, tooltipDe;

          if (accounts.menuTypeDisabled == 0) {
            accountStatus = <label className="label label-status label-success">Enabled</label>
            disabled = '';
            enabled = "disabled";
            tooltipEn = '';
            tooltipDe = 'Disable Account';
          } else {
            accountStatus = <label className="label label-status label-warning">Disabled</label>
            disabled = 'disabled';
            enabled = '';
            tooltipEn = 'Enable Account';
            tooltipDe = '';
          }
          let helperText = '';
          let actionsBtns = <><button type="button" data-tip={tooltipEn} onClick={thisObj.updateAccount.bind(thisObj, 'enable', id)} className="btn action-btn-common btn-enable" disabled={enabled}>&nbsp;</button>&nbsp;
          <button type="button" data-tip={tooltipDe} onClick={thisObj.updateAccount.bind(thisObj, 'disable', id)} className="btn action-btn-common btn-disable" disabled={disabled}>&nbsp;</button>&nbsp;
          <Link type="button" data-tip='Manage Menu Items' to={`/sub-menus/${id}`} className="btn action-btn-common btn-manage">&nbsp;</Link>&nbsp;
          <Link data-tip='Edit' to={`/menu-manager/${id}`} className="btn action-btn-common btn-edit">&nbsp;</Link>&nbsp;
       
          <button type="button" data-tip='Delete' onClick={thisObj.updateAccount.bind(thisObj, 'Delete', id)} className="btn action-btn-common btn-delete">&nbsp;</button>
            <ReactTooltip /></>;
          if (accounts.menuDefault == 1) {
            helperText = <FormHelperText style={{ 'color': '#f50057' }} className="usr-info-text">Default cannot be delete or disable</FormHelperText>;
            actionsBtns = <><Link type="button" data-tip='Manage Menu Items' to={`/sub-menus/${id}`} className="btn action-btn-common btn-manage">&nbsp;</Link>&nbsp;
             <Link data-tip='Edit' to={`/menu-manager/${id}`} className="btn action-btn-common btn-edit">&nbsp;</Link>&nbsp;
 
            <ReactTooltip /></>;
          }
          return <tr>

            <td>{index + sNo}</td>
            <td>{accounts.title}{helperText}</td>
            <td>{accountStatus} </td>
            <td>

              {actionsBtns}


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
                      <li><a> Menu Manager</a></li>
                      <li><a className="active">Menu List</a></li>
                    </ul>
                    <div className="add-link">


                      <Button data-tip='Search' mini onClick={thisObj.toggleSearchBox.bind(thisObj)} variant="contained" color="secondary" aria-label="Add">
                        <Icon icon={search} />
                      </Button>&nbsp;
                      <Button data-tip='Add New Menu' mini component={Link} to="/menu-manager" variant="contained" color="primary" aria-label="Add">
                        <AddIcon />
                      </Button>&nbsp;


                      <ReactTooltip />

                      <div class="ad-form list-cunt-dd">
                        <div class="select-box">
                          <FormControl fullWidth className="selectbox-main" >

                            <Select
                              value={listPerPage}
                              onChange={this._onSelectPageCountChange}
                              className="selectbox-manual"
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
                                  <MenuItem value="title">Title</MenuItem>


                                </Select>
                              </FormControl>
                            </div>
                          </div>
                          <div className="ad-form col-sm-12">
                            <div className="form-group search-box">

                              <FormControl fullWidth>
                                <InputLabel htmlFor="accountStatus">Status</InputLabel>
                                <Select
                                  value={searchData.accountStatus}
                                  onChange={this._onTextFieldChange}
                                  inputProps={{
                                    name: 'accountStatus',
                                    id: 'accountStatus',
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  <MenuItem value="Disabled">Disabled</MenuItem>
                                  <MenuItem value="Enabled">Enabled</MenuItem>

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
                            <th onClick={thisObj.handleSort.bind(thisObj, 'title', sortOrder)} className="border-bottom-0 sort">Menu Name <i className={`fa ${(sortKey == "title") ? sortClass : "fa-sort"}`}></i></th>
                            <th className="border-bottom-0">Status</th>
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


export default menuList;
