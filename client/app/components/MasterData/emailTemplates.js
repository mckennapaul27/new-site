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
import { ExportToCsv } from 'export-to-csv';
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
class emailTemplates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' Master Data',
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
      sortKey: 'template_subject',
      searchData: {
        searchKey: '',
        searchBy: '',
        accountStatus: ''
      }

    };
    document.title = "Email templates";
    document.body.classList.remove('login-body');
    this.loadEmailTemplates = this.loadEmailTemplates.bind(this);
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
    fetch('/api/masterdata/emailtemplatescount').then(res => res.json())
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
    this.loadEmailTemplates(activePage);
  }

  loadEmailTemplates(activePage) {
    const { searchData, pageLimit,sortKey, sortOrder } = this.state;
    fetch('/api/masterdata/emailtemplates', {
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
    this.loadEmailTemplates(pageNumber);
  }
  handleSort(sortKey, sortOrder, e) {
    sortOrder = (sortOrder == 'desc') ? 'asc' : 'desc';
    let sortClass = (sortOrder == 'desc') ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up';
    setTimeout(() => {
      this.setState({ sortClass: sortClass, sortOrder: sortOrder, sortKey: sortKey });
      this.loadEmailTemplates(1);
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
      this.loadEmailTemplates(1);
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
      this.loadEmailTemplates(1);
    }, 100);


  }
  searchSubmit(event) {
    event.preventDefault();
    this.loadEmailTemplates(1);
  }
 
  render() {
    const { logout, passval, arrayList, pageTitle,sortClass, sortOrder, sortKey,showLoading, searchData, listPerPage, pageLimit, isLoading, norecords, totalRecords } = this.state;

    var arr = [];
    var thisObj = this;
    Object.keys(arrayList).forEach(function (key) {
      arr.push(arrayList[key]);
    });
    var accountList = '';
    var loading = showLoading?<><div class="head-load"><span>Loading...</span></div></>:null;
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
         
          return <tr>

            <td>{index + sNo}</td>
            <td>{accounts.template_subject}</td>
           
            <td>

             <Link data-tip='Edit' to={`/masterdata/email/manager/${id}`} className="btn action-btn-common btn-edit">&nbsp;</Link>&nbsp;
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
                      <li><a> Master Data</a></li>
                      <li><a className="active">Email Templates</a></li>
                    </ul>
                    <div className="add-link">


                      <Button data-tip='Search' mini onClick={thisObj.toggleSearchBox.bind(thisObj)} variant="contained" color="secondary" aria-label="Add">
                        <Icon icon={search} />
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
                                  <MenuItem value="template_subject">Template Subject</MenuItem>
                                  
                               
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
                            <th onClick={thisObj.handleSort.bind(thisObj, 'template_subject', sortOrder)} className="border-bottom-0 sort">Template Subject <i className={`fa ${(sortKey == "template_subject") ? sortClass : "fa-sort"}`}></i></th>
                        
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


export default emailTemplates;
