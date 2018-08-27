import React, { Component } from 'react';
import 'whatwg-fetch';
import NotFound from './App/NotFound';
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ChangePassword from './ChangePassword/ChangePassword';
import AdminAccounts from './AdminAccounts/AdminAccounts';
import AccountManager from './AdminAccounts/AccountManager';
import AccountView from './AdminAccounts/AccountView';
import MyAccount from './AdminAccounts/MyAccount';

import UserAccounts from './UserAccounts/UserAccounts';
import UserManager from './UserAccounts/UserManager';
import UserAccountView from './UserAccounts/UserAccountView';
import UserTracks from './UserAccounts/UserTracks';
import UserTurnoverReg from './UserAccounts/UserTurnoverReg';
import UserInterestedList from './UserAccounts/UserInterestedList';
import emailTemplates from './MasterData/emailTemplates';
import templateManager from './MasterData/templateManager';
import menuList from './MenuManager/menuList';
import menuManager from './MenuManager/menuManager';
import subMenuList from './MenuManager/subMenuList';
import submenuManager from './MenuManager/submenuManager';
import Logout from './Logout/Logout';
import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom'
class CusRouter extends Component {
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
            <Switch>
                <Route exact path="/" component={Login} />
                <Route exact path="/forgot-password" component={ForgotPassword} />
                <Route exact path="/change-password/:key" component={ChangePassword} />
                <Route exact activeStyle={{ color: 'green' }} path="/admin-accounts" component={AdminAccounts} />

                <Route exact activeStyle={{ color: 'green' }} path="/manager" component={AccountManager} />
                <Route exact path="/manager/:id" component={AccountManager} />
                <Route exact path="/manager/view/:id" component={AccountView} />

                <Route exact activeStyle={{ color: 'green' }} path="/user-accounts" component={UserAccounts} />
                <Route exact activeStyle={{ color: 'green' }} path="/user/manager" component={UserManager} />
                <Route exact path="/user/manager/:id" component={UserManager} />
                <Route exact path="/user/manager/view/:id" component={UserAccountView} />
                <Route exact path="/user-tracks" component={UserTracks} />
                <Route exact path="/turnover-request" component={UserTurnoverReg} />
                <Route exact path="/user-interested" component={UserInterestedList} />
                <Route exact path="/masterdata/email-templates" component={emailTemplates} />
                <Route exact path="/masterdata/email/manager/:id" component={templateManager} />
                <Route exact path="/menus" component={menuList} />

                <Route exact activeStyle={{ color: 'green' }} path="/menu-manager" component={menuManager} />
                <Route exact path="/menu-manager/:id" component={menuManager} />

                <Route exact path="/sub-menus/:id" component={subMenuList} />
                <Route exact activeStyle={{ color: 'green' }} path="/submenu-manager/:id" component={submenuManager} />
                <Route exact path="/submenu-manager/:id/:submenuid" component={submenuManager} />
                <Route exact activeStyle={{ color: 'green' }} path="/my-account" component={MyAccount} />
                <Route exact activeStyle={{ color: 'green' }} path="/logout" component={Logout} />
                <Route activeStyle={{ color: 'green' }} path="/dashboard" render={() => (
                    logout ? (<Redirect to='/' />) : (<Dashboard />)
                )}
                />
                <Route component={NotFound} />
            </Switch>


        );
    }
}


export default CusRouter;
