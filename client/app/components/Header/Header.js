import React, { Component } from 'react';
import { Icon } from 'react-icons-kit';
import {userO} from 'react-icons-kit/fa/userO';
import {cog} from 'react-icons-kit/fa/cog';
import {signOut} from 'react-icons-kit/fa/signOut'
import { loadCSS } from "fg-loadcss/src/loadCSS";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,NavLink,
  withRouter
} from 'react-router-dom'
import {
  setInStorage,
  getFromStorage,
} from '../../utills/common';
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
     
      isLoading: false,
      logout: false

    };
    
  }
  componentDidMount() {
    loadCSS(
      "https://use.fontawesome.com/releases/v5.1.0/css/all.css",
      document.querySelector("#insertion-point-jss")
    );
  }

  


  render() {
    const { logout,pageTitle } = this.state;
    
   
    if (!logout) {
      return (
        <>
        
          <div className="main-top">
            <div className="menu-title">
         
              <h1>{this.props.pageTitle}</h1>
            </div>
            <div className="navbar-right admin-avator">
              <div className="dropdown user-dropdown">
                <a className="ripple" href="javascript:void(0);" className="dropdown-toggle" data-toggle="dropdown">
                  <span className="admin-icon"><img src="/assets/images/admin-icon.png" alt="admin" /></span>
                </a>
                <ul className="dropdown-menu ad-dropdown-menu"> 
                  <li><NavLink className="ripple " to="/my-account">
                  <i className={`fa fa-user`} ></i> 
                   Profile</NavLink></li>
               
                  <li><NavLink className="ripple "  to="/" > <i className={`fa  fa-cog`} ></i>  Settings</NavLink></li>
                  <li>

                    <NavLink className="ripple"   to="/logout"><i className={`fa fa-sign-out-alt`} ></i> Log Out</NavLink>
                  </li>
                </ul>
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

export default Header;
