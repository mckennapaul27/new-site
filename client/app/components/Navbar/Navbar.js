import React, { Component } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import 'whatwg-fetch';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';

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
    getAdminModules

} from '../../utills/common';
class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            logout: false

        };
    }
    componentDidMount() {
        
      }
    render() {
        const { logout } = this.state;
        return (
            <>
                <div className="left-sidebar">
                    <span className="menu-res"><NavLink to="/" className="slide-toggle"><img src="assets/images/menu-close.svg" alt="menu" /></NavLink></span>
                    <div className="logo-sec text-center">
                        <img src="/assets/images/logo.png" alt="Couponarbitrage" />
                    </div>
                    <div className="sidebar-menu">
                        <SideNav className="side_menu" defaultSelected='my-account'>
                            <Nav id='dashboard'>
                                <NavIcon><i className={`fa fa-home`} ></i> </NavIcon>
                                <NavText> <NavLink to="/dashboard"> Dashboard</NavLink> </NavText>
                            </Nav>
                            {
                                getAdminModules().map(function (modules) {
                                    return (
                                        <Nav selected={modules.name} id={modules.name}>
                                            <NavIcon><i className={`fa ${modules.icon}`} ></i> </NavIcon>
                                            <NavText> {modules.text} </NavText>
                                            {
                                                modules.submodules.map(function (submodules) {
                                                    return (
                                                        <Nav id={modules.name}>
                                                            <NavText><NavLink to={submodules.url}>{submodules.name}</NavLink></NavText>
                                                        </Nav>
                                                    );
                                                })
                                            }
                                        </Nav>
                                    );
                                })
                            }

                        </SideNav>
                    </div>
                </div>
            </>
        );
    }
}


export default Navbar;
