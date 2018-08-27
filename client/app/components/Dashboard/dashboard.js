import React, { Component } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Navbar from '../Navbar/Navbar';
import 'whatwg-fetch';
import toastr from 'toastr'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
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
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: ' DASHBOARD STATISTICS OVERVIEW',
      isLoading: false,
      logout: false
    };


    document.title = "Dashboard";
    document.body.classList.remove('login-body');
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
              logout: true
            });
          }
        });
    } else {
      this.setState({
        isLoading: false,
        logout: true
      });
    }
    fetch('/api/account/verify')
      .then(res => res.json())
      .then(json => {

      });

  }


  render() {
    const { logout, passval,pageTitle } = this.state;
    const options = {
      chart: {
        type: 'column',
        maxWidth: '80%'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Turnover Cashback',
        align: 'left'
      },
      subtitle: {
        text: null
      },
      xAxis: {
        min: 0,
        max: 4,
        maxPadding: 0,
        categories: [
          'Skrill Cashback',
          'SBObet Cashback',
          'Neteller Cashback',
          'Asian Connect Cashback',
          'Ecopayz Cashback'
        ],
        crosshair: true

      },
      yAxis: {
        min: 0,
        title: {
          text: null
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>£ {point.y:.1f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: [{
        name: 'Total Commission',
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

      }, {
        name: 'Total Users',
        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

      }, {
        name: 'Site Commission',
        data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

      }]
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
                      <li><a className="active"><i className={`fa fa-home`} ></i>  Dashboard</a></li>
                    </ul>
                  </div>
                  <div className="stacks">
                    <div className="row">
                      <div className="dsh-user-wrap">
                        <div className="dsh-user user-bg">
                          <a href="javascript:void(0);">
                            <div className="stk-title stk-user-title">
                              <h5>&nbsp;</h5>
                            </div>
                            <div className="stk-det stk-user-det">
                              <h4>349</h4>
                              <p>User Accounts List</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title uncnfrm-bg">
                              <h5>Unconfirmed</h5>
                            </div>
                            <div className="stk-det uncnfrm-det">
                              <h4>454</h4>
                              <p>Cashback & Bonuses Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title unaprv-bg">
                              <h5>Unapproved</h5>
                            </div>
                            <div className="stk-det unaprv-det">
                              <h4>136</h4>
                              <p>Cashback & Bonuses Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title fns-clm-bg">
                              <h5>Finished</h5>
                            </div>
                            <div className="stk-det fns-clm-det">
                              <h4>74</h4>
                              <p>Cashback & Bonuses Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title paid-clm-bg">
                              <h5>Paid</h5>
                            </div>
                            <div className="stk-det paid-clm-det">
                              <h4>284</h4>
                              <p>Cashback & Bonuses Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title cncl-clm-bg">
                              <h5>Cancelled</h5>
                            </div>
                            <div className="stk-det cncl-clm-det">
                              <h4>275</h4>
                              <p>Cashback & Bonuses Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user user-bg">
                          <a href="javascript:void(0);">
                            <div className="stk-title stk-user-title">
                              <h5>&nbsp;</h5>
                            </div>
                            <div className="stk-det stk-user-det">
                              <h4>126</h4>
                              <p>Turnover Registration Request</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title uncnfrm-bg">
                              <h5>Unconfirmed</h5>
                            </div>
                            <div className="stk-det uncnfrm-det">
                              <h4>454</h4>
                              <p>Revenue Share cashback Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title unaprv-bg">
                              <h5>Unapproved</h5>
                            </div>
                            <div className="stk-det unaprv-det">
                              <h4>136</h4>
                              <p>Revenue Share cashback Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title fns-clm-bg">
                              <h5>Finished</h5>
                            </div>
                            <div className="stk-det fns-clm-det">
                              <h4>74</h4>
                              <p>Revenue Share cashback Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title cncl-clm-bg">
                              <h5>Cancelled</h5>
                            </div>
                            <div className="stk-det cncl-clm-det">
                              <h4>275</h4>
                              <p>Revenue Share cashback Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="dsh-user-wrap">
                        <div className="dsh-user">
                          <a href="javascript:void(0);">
                            <div className="stk-title paid-clm-bg">
                              <h5>Cashback Credtis</h5>
                            </div>
                            <div className="stk-det paid-clm-det">
                              <h4>284</h4>
                              <p>Revenue Share cashback Claims</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="white-box trn-ovr-chart mt-20">
                    <div id="container" style={{ "max-width": "100% !important", "height": "100% !important", "margin": "0 auto" }} ><HighchartsReact
                      highcharts={Highcharts}
                      options={options}
                    /></div>
                  </div>
                  <div className="chat-list-wrap mt-20">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="white-box re-chat">
                          <h4>Recent Chat History <a href="javascript:void(0);"></a></h4>
                          <div className="user-chat-wrap">
                            <div className="user-icon">
                              <img src="/assets/images/user-i.svg" alt="user" />
                            </div>
                            <div className="user-chat-content">
                              <h5>User Name <small>2017-05-06 00:38 AM</small></h5>
                              <p>When I wrote the message all arbs were around 1-2% profit on stake, I dont consider that worth doing if I'm laying down say £500 to get less than a tenner profit</p>
                            </div>
                          </div>
                          <div className="user-chat-wrap ad-chat-wrap">
                            <div className="user-chat-content">
                              <h5><small>2017-05-06 00:38 AM</small> Admin</h5>
                              <p>When I wrote the message all arbs were around 1-2% profit on stake, I dont consider that worth doing if I'm laying down say £500 to get less than a tenner profit</p>
                            </div>
                            <div className="user-icon">
                              <img src="/assets/images/user-i.svg" alt="user" />
                            </div>
                          </div>
                          <div className="user-chat-wrap">
                            <div className="user-icon">
                              <img src="/assets/images/user-i.svg" alt="user" />
                            </div>
                            <div className="user-chat-content">
                              <h5>User Name <small>2017-05-06 00:38 AM</small></h5>
                              <p>When I wrote the message all arbs were around 1-2% profit on stake, I dont consider that worth doing if I'm laying down say £500 to get less than a tenner profit</p>
                            </div>
                          </div>
                          <div className="user-chat-wrap">
                            <div className="user-icon">
                              <img src="/assets/images/user-i.svg" alt="user" />
                            </div>
                            <div className="user-chat-content">
                              <h5>User Name <small>2017-05-06 00:38 AM</small></h5>
                              <p>When I wrote the message all arbs were around 1-2% profit on stake, I dont consider that worth doing if I'm laying down say £500 to get less than a tenner profit</p>
                            </div>
                          </div>
                          <div className="user-chat-wrap ad-chat-wrap">
                            <div className="user-chat-content">
                              <h5><small>2017-05-06 00:38 AM</small> Admin</h5>
                              <p>When I wrote the message all arbs were around 1-2% profit on stake, I dont consider that worth doing if I'm laying down say £500 to get less than a tenner profit</p>
                            </div>
                            <div className="user-icon">
                              <img src="/assets/images/user-i.svg" alt="user" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-8">
                        <div className="white-box re-chat">
                          <h4>Recent Betting  Subscription List <a href="javascript:void(0);"></a></h4>
                          <div className="table-responsive dash-table-res">
                            <table className="table center-aligned-table">
                              <thead>
                                <tr className="bg-light">
                                  <th className="border-bottom-0 sub-th">User Name</th>
                                  <th className="border-bottom-0 sub-th">Email</th>
                                  <th className="border-bottom-0 sub-th">Plan</th>
                                  <th className="border-bottom-0 sub-th">Subscribed</th>
                                  <th className="border-bottom-0 sub-th">Payment</th>
                                  <th className="border-bottom-0 sub-th">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Weekly</td>
                                  <td>24/04/2017</td>
                                  <td>Paypal</td>
                                  <td><label className="label label-status label-success">Approved</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Monthly</td>
                                  <td>24/04/2017</td>
                                  <td>Skrill</td>
                                  <td><label className="label label-status label-info">Waiting</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Weekly</td>
                                  <td>24/04/2017</td>
                                  <td>Paypal</td>
                                  <td><label className="label label-status label-success">Approved</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Weekly</td>
                                  <td>24/04/2017</td>
                                  <td>Skrill</td>
                                  <td><label className="label label-status label-danger">Expired</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Monthly</td>
                                  <td>24/04/2017</td>
                                  <td>Skrill</td>
                                  <td><label className="label label-status label-success">Approved</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Monthly</td>
                                  <td>24/04/2017</td>
                                  <td>Paypal</td>
                                  <td><label className="label label-status label-success">Approved</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Weekly</td>
                                  <td>24/04/2017</td>
                                  <td>Paypal</td>
                                  <td><label className="label label-status label-info">Waiting</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Monthly</td>
                                  <td>24/04/2017</td>
                                  <td>Skrill</td>
                                  <td><label className="label label-status label-success">Approved</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Weekly</td>
                                  <td>24/04/2017</td>
                                  <td>Paypal</td>
                                  <td><label className="label label-status label-danger">Expired</label></td>
                                </tr>
                                <tr>
                                  <td>tamasfeher89</td>
                                  <td>tamas.feher89@gmail.com</td>
                                  <td>Monthly</td>
                                  <td>24/04/2017</td>
                                  <td>Skrill</td>
                                  <td><label className="label label-status label-success">Approved</label></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
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


export default Dashboard;
