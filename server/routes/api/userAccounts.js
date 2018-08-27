const config = require('../../../config/config');
const helpers = require('../../../config/helpers');
const MongoClient = require('mongodb').MongoClient;
const isDev = process.env.NODE_ENV !== 'production';
const nodemailer = require('nodemailer');
const collection = 'jos_users';
const bcrypt = require('bcrypt');
module.exports = (app) => {

    app.post('/api/user/create', (req, res, next) => {
        const { body } = req;
        const {
            accountData,
            sendMail
        } = body;

        if (!accountData.name) {
            return res.send({
                success: false,
                message: 'Please enter your name'
            });
        } if (!accountData.username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
            });
        } if (!accountData.email) {
            return res.send({
                success: false,
                message: 'Please enter your email'
            });
        }
        if (!accountData.password) {
            return res.send({
                success: false,
                message: 'Please enter your password'
            });
        }
        if (!accountData.cpassword) {
            return res.send({
                success: false,
                message: 'Please confirm your password'
            });
        }

        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            // Check username if already exist
            var unamequery = { username: accountData.username, usertype: "Registered", accountDeleted: 0 };
            dbo.collection(collection).find(unamequery).toArray(function (err, usernameRes) {
                if (usernameRes.length > 0) {
                    return res.send({
                        success: false,
                        message: 'Username already exist!'
                    });
                }
                // Check Email if already exist
                var emailquery = { email: accountData.email, usertype: "Registered", accountDeleted: 0 };
                dbo.collection(collection).find(emailquery).toArray(function (err, emailRes) {
                    if (emailRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Email address already exist!'
                        });
                    }

                    // Else create a new account



                    dbo.collection(collection).find().count(function (err, userCount) {
                        console.log('userCount', userCount);
                        accountDetails = {
                            epiCode: userCount + 1,
                            name: accountData.name,
                            username: accountData.username,
                            last_name: accountData.last_name,
                            email: accountData.email,
                            password: helpers.generateHashPassword(accountData.password),
                            usertype: 'Registered',
                            block: 0,
                            sendEmail: 0,
                            gid: 0,
                            gcmId: "",
                            iosGcmId: "",
                            registerDate: Date.now(),
                            lastvisitDate: 0,
                            activation: 0,
                            params: "",
                            ecopayzAccountId: "",
                            moneyBookerId: "",
                            moneyBookerBonus: "",
                            moneyBookerIdAdded: "",
                            moneyBookerAwardto: 0,
                            accountCountry: accountData.accountCountry,
                            accountPhone: accountData.accountPhone,
                            accountAddress: "",
                            accountGender: "",
                            accountDob: "",
                            bankAccountName: accountData.bankAccountName,
                            bankAccountSortCode: accountData.bankAccountSortCode,
                            bankAccountNumber: accountData.bankAccountNumber,
                            accountPaypalEmail: accountData.accountPaypalEmail,
                            accountSkrillEmail: accountData.accountSkrillEmail,
                            accountNetellerEmail: accountData.accountNetellerEmail,
                            accountReferrence: accountData.accountReferrence,
                            referred_by: "",
                            referrdapp_by: "",
                            accountActivated: 0,
                            accessPrivilege: "",
                            accessModule: "",
                            accountLastUpdateTime: 0,
                            accountSharbsLastUpdateTime: 0,
                            accountLatestLoginTime: 0,
                            accountLatestLoginIP: "",
                            accountLatestLoginUA: "",
                            accountLoginCount: 0,
                            accountDeleted: 0,
                            accountLoginState: "",
                            offerSentDate: "",
                            unsubscribe: "",
                            planId: "",
                            paymentStatus: accountData.paymentStatus,
                            vipmail: "",
                            uservip: accountData.uservip,
                            cutodds_auth: "",
                            user_oauth_provider: "",
                            user_oauth_id: "",
                            is_super_Admin: 0,
                        };

                        dbo.collection(collection).insertOne(accountDetails, function (err, doc) {

                            let result = doc[0];
                            var insertId = doc["ops"][0]["_id"];
                            if (err) {
                                return res.send({
                                    success: false,
                                    message: 'Something went wrong. Please try again 1'
                                });
                            }
                            if (sendMail) {
                                var query = { template_name: 'new_account_email_from_admin' };
                                dbo.collection('email_templates').find(query).toArray(function (err, temp) {

                                    if (err) {
                                        return res.send({
                                            success: false,
                                            message: 'Something went wrong. Please try again 2'
                                        });
                                    }
                                    var template = temp[0];
                                    var subject = template.template_subject;
                                    var htmlStr = template.template_content;
                                    var resultHtml = htmlStr.replace(/{USER_NAME}/g, accountData.username);
                                    resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                    resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                    resultHtml = resultHtml.replace(/{EMAIL}/g, accountData.email);
                                    resultHtml = resultHtml.replace(/{USER_TYPE}/g, 'User');
                                    resultHtml = resultHtml.replace(/{PWD}/g, accountData.password);
                                    resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.base_url + 'login/');
                                    var sendMail = helpers.sendCustomeMail(accountData.username, 'manigandan.g@officialgates.com', resultHtml, subject);
                                    return res.send({
                                        success: true,
                                        message: 'Account created successfully.'
                                    });
                                    db.close();
                                });
                            } else {
                                return res.send({
                                    success: true,
                                    message: 'Account created successfully.'
                                });
                                db.close();
                            }



                        });

                    });


                });
            });




        });



    });


    app.post('/api/user/accouts', (req, res, next) => {

        const { body } = req;
        const {
            activePage,
            pageLimit,
            searchData,
            sortKey,
            sortOrder
        } = body;

        let skippage = pageLimit * (activePage - 1);
        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { accountDeleted: 0, usertype: "Registered" };
            if (searchData.accountStatus == 'Enabled') {
                query.block = 0;
            } if (searchData.accountStatus == 'Disabled') {
                query.block = 1;
            }
            if (searchData.searchBy == 'epiCode' && searchData.searchKey) {
                query.epiCode = parseInt(searchData.searchKey);
            } else if (searchData.searchKey && searchData.searchBy) {

                //  query[searchData.searchBy] = '/' + searchData.searchKey +'/i';
                query[searchData.searchBy] = new RegExp(searchData.searchKey, 'i');
                // query[searchData.searchBy] =  { '$regex' : '/.*'+searchData.searchKey+'./' , '$options':"i"}
            }
            var mysort = {};
            if (sortOrder == 'asc') {
                mysort[sortKey] = 1;
            } else {
                mysort[sortKey] = -1;
            }
            dbo.collection(collection).find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    return res.send({
                        success: true,
                        records: result,

                    });
                }
                return res.send({
                    success: false,

                });

                db.close();
            });
        });

    });

    app.get('/api/user/accoutsCount', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { accountDeleted: 0, usertype: "Registered" };

            dbo.collection(collection).find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.get('/api/user/getaccountby_id', (req, res, next) => {
        const { query } = req;
        const { login_id } = query;




        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {

            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            try {
                var id = new require('mongodb').ObjectID(login_id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid token 1 '
                });
            }
            var query = { _id: id, accountDeleted: 0 };
            dbo.collection(collection).find(query).toArray(function (err, userData) {

                if (err) {
                    return res.send({
                        success: false,
                        message: 'Something went wrong. Please try again'
                    });
                }

                if (userData.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Error: Invalid token 2 '
                    });
                } else {
                    const userRow = userData[0];
                    // DO ACTION
                    return res.send({
                        success: true,
                        result: userRow
                    });
                }
                db.close();
            });
        });



    });



    app.post('/api/user/update-accounts', (req, res, next) => {
        const { body } = req;
        const {
            accountData,
            emailChecked,
            passChecked,
            _id,
        } = body;


        if (!accountData.name) {
            return res.send({
                success: false,
                message: 'Please enter your name'
            });
        } if (!accountData.username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
            });
        } if (!accountData.email) {
            return res.send({
                success: false,
                message: 'Please enter your email'
            });
        }
        if (passChecked) {
            if (!accountData.password) {
                return res.send({
                    success: false,
                    message: 'Please enter your password'
                });
            }
            if (!accountData.cpassword) {
                return res.send({
                    success: false,
                    message: 'Please confirm your password'
                });
            }
        }

        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {

                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            try {
                var id = new require('mongodb').ObjectID(accountData._id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid user'
                });
            }

            var query = { _id: id, accountDeleted: 0, usertype: "Registered", };
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid user'
                    });
                }
                var unamequery = { username: accountData.username, usertype: "Registered", accountDeleted: 0, _id: { '$ne': id } };
                dbo.collection(collection).find(unamequery).toArray(function (err, usernameRes) {
                    if (usernameRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Username already exist!'
                        });
                    }
                    var emailquery = { email: accountData.email, usertype: "Registered", accountDeleted: 0, _id: { '$ne': id } };
                    dbo.collection(collection).find(emailquery).toArray(function (err, emailRes) {

                        if (err) throw err;

                        if (emailRes.length > 0) {
                            return res.send({
                                success: false,
                                message: 'Email address already exist!'
                            });
                        }

                        const userData = result[0];
                        let updateData = {
                            name: accountData.name,
                            last_name: accountData.last_name,
                            username: accountData.username,
                            email: accountData.email,
                            accountCountry: accountData.accountCountry,
                            accountPhone: accountData.accountPhone,
                            bankAccountSortCode: accountData.bankAccountSortCode,
                            accountReferrence: accountData.accountReferrence,
                            accountSkrillEmail: accountData.accountSkrillEmail,
                            accountNetellerEmail: accountData.accountNetellerEmail,
                            accountPaypalEmail: accountData.accountPaypalEmail,
                            bankAccountName: accountData.bankAccountName,
                            bankAccountNumber: accountData.bankAccountNumber,
                            paymentStatus: accountData.paymentStatus,
                            uservip: accountData.uservip

                        };
                        if (passChecked) {
                            updateData.password = helpers.generateHashPassword(accountData.password);

                        }
                        dbo.collection(collection).findOneAndUpdate({
                            _id: userData._id,

                        }, {
                                $set: updateData
                            }, null, (err, sessions) => {
                                console.log('err', err);
                                if (err) {
                                    return res.send({
                                        success: false,
                                        message: 'Something went wrong. Please try again'
                                    });
                                }

                                if (emailChecked) {
                                    var query = { template_name: 'change_password_mail_from_admin' };
                                    dbo.collection('email_templates').find(query).toArray(function (err, temp) {

                                        if (err) {
                                            return res.send({
                                                success: false,
                                                message: 'Something went wrong. Please try again 2'
                                            });
                                        }
                                        var template = temp[0];
                                        var subject = template.template_subject;
                                        var htmlStr = template.template_content;
                                        var resultHtml = htmlStr.replace(/{USER_NAME}/g, userData.username);
                                        resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                        resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                        resultHtml = resultHtml.replace(/{EMAIL}/g, userData.email);
                                        resultHtml = resultHtml.replace(/{USER_TYPE}/g, 'User ');
                                        resultHtml = resultHtml.replace(/{PWD}/g, accountData.password);
                                        resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.base_url + 'login/');
                                        var sendMail = helpers.sendCustomeMail(userData.username, 'manigandan.g@officialgates.com', resultHtml, subject);
                                        return res.send({
                                            success: true,
                                            message: 'Account updated successfully.'
                                        });
                                        db.close();
                                    });
                                } else {
                                    return res.send({
                                        success: true,
                                        message: 'Account updated successfully.'
                                    });
                                    db.close();
                                }
                            });
                    });


                });

            });
        });



    });

    app.post('/api/user/updateadmin_accounts', (req, res, next) => {
        const { body } = req;
        const {
            action,
            _id,

        } = body;


        if (!action) {
            return res.send({
                success: false,
                message: 'Action missing'
            });
        } if (!_id) {
            return res.send({
                success: false,
                message: 'Id missing'
            });
        }


        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {

                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            try {
                var id = new require('mongodb').ObjectID(_id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid user'
                });
            }

            var query = { _id: id, accountDeleted: 0 };

            dbo.collection(collection).find(query).toArray(function (err, result) {

                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid user'
                    });
                }

                const userData = result[0];
                let updateData;
                let msg;
                if (action == 'enable') {
                    updateData = { block: 0 };
                    msg = 'Account enabled successfully';
                } else if (action == 'disable') {
                    updateData = { block: 1 };
                    msg = 'Account disbled successfully';
                } else if (action == 'Delete') {
                    updateData = { accountDeleted: Date.now() };
                    msg = 'Account deleted successfully';

                }
                dbo.collection(collection).findOneAndUpdate({
                    _id: userData._id,

                }, {
                        $set: updateData
                    }, null, (err, sessions) => {
                        if (err) {
                            return res.send({
                                success: false,
                                message: 'Something went wrong. Please try again'
                            });
                        }
                        return res.send({
                            success: true,
                            message: msg
                        });
                    });


                db.close();
            });
        });



    });

    app.get('/api/user/exportusers', (req, res, next) => {




        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { accountDeleted: 0, usertype: "Registered" };

            var selectedColumn = { 'epiCode': true, 'name': 1, 'username': 1, 'email': 1, 'registerDate': 1, 'moneyBookerId': 1, 'moneyBookerBonus': 1, 'accountPhone': 1, '_id': 0 };
            dbo.collection(collection).find(query).project(selectedColumn).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    return res.send({
                        success: true,
                        records: result,

                    });
                }
                return res.send({
                    success: false,

                });

                db.close();
            });
        });

    });


    // User Tracking

    app.post('/api/user/tracking_list', (req, res, next) => {

        const { body } = req;
        const {
            activePage,
            pageLimit,
            searchData,
            sortKey,
            sortOrder
        } = body;

        let skippage = pageLimit * (activePage - 1);
        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { track_deleted: 0 };
            if (searchData.accountStatus == 'Enabled') {
                query.block = 0;
            } if (searchData.accountStatus == 'Disabled') {
                query.block = 1;
            }
            if (searchData.searchBy == 'epiCode' && searchData.searchKey) {
                query.epiCode = parseInt(searchData.searchKey);
            } else if (searchData.searchKey && searchData.searchBy) {

                //  query[searchData.searchBy] = '/' + searchData.searchKey +'/i';
                query[searchData.searchBy] = new RegExp(searchData.searchKey, 'i');
                // query[searchData.searchBy] =  { '$regex' : '/.*'+searchData.searchKey+'./' , '$options':"i"}
            }
            var mysort = {};
            if(sortOrder == 'asc'){
                mysort[sortKey] = 1;
            }else{
                mysort[sortKey] = -1;
            }
            dbo.collection('user_traking').find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    return res.send({
                        success: true,
                        records: result,

                    });
                }
                return res.send({
                    success: false,

                });

                db.close();
            });
        });

    });

    app.get('/api/user/userTrackingCount', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { track_deleted: 0 };

            dbo.collection('user_traking').find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.post('/api/user/turnover_req', (req, res, next) => {

        const { body } = req;
        const {
            activePage,
            pageLimit,
            searchData,
            sortKey,
            sortOrder
        } = body;

        let skippage = pageLimit * (activePage - 1);
        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = {};
            if (searchData.accountStatus == 'Enabled') {
                query.block = 0;
            } if (searchData.accountStatus == 'Disabled') {
                query.block = 1;
            }
            if (searchData.searchBy == 'epiCode' && searchData.searchKey) {
                query.epiCode = parseInt(searchData.searchKey);
            } else if (searchData.searchKey && searchData.searchBy) {

                //  query[searchData.searchBy] = '/' + searchData.searchKey +'/i';
                query[searchData.searchBy] = new RegExp(searchData.searchKey, 'i');
                // query[searchData.searchBy] =  { '$regex' : '/.*'+searchData.searchKey+'./' , '$options':"i"}
            }
            var mysort = {};
            if(sortOrder == 'asc'){
                mysort[sortKey] = 1;
            }else{
                mysort[sortKey] = -1;
            }
            dbo.collection('turnover_registration').find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    return res.send({
                        success: true,
                        records: result,

                    });
                }
                return res.send({
                    success: false,

                });

                db.close();
            });
        });

    });

    app.get('/api/user/turnover_req_count', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = {};

            dbo.collection('turnover_registration').find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.post('/api/user/updateturnover_req', (req, res, next) => {
        const { body } = req;
        const {
            action,
            _id,

        } = body;


        if (!action) {
            return res.send({
                success: false,
                message: 'Action missing'
            });
        } if (!_id) {
            return res.send({
                success: false,
                message: 'Id missing'
            });
        }


        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {

                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            try {
                var id = new require('mongodb').ObjectID(_id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid user'
                });
            }

            var query = { _id: id };

            dbo.collection('turnover_registration').find(query).toArray(function (err, result) {

                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid request'
                    });
                }

                const userData = result[0];
                let updateData;
                let msg;
                let updateAction = false;
                let deleteAction = false;
                let templateName = '';
                if (action == 'approve') {
                    updateAction = true;
                    templateName = 'turnover_application_successful';
                    updateData = { registrationApproved: Date.now() };
                    msg = 'Request approved successfully';
                } else if (action == 'decline') {
                    templateName = 'turnover_application_declined';
                    updateAction = true;
                    updateData = { registrationApproved: 1 };
                    msg = 'Request declined successfully';
                } else if (action == 'Delete') {
                    deleteAction = true;
                    updateData = { accountDeleted: Date.now() };
                    msg = 'Request deleted successfully';

                }
                if (updateAction) {
                    dbo.collection('turnover_registration').findOneAndUpdate({
                        _id: userData._id,

                    }, {
                            $set: updateData
                        }, null, (err, sessions) => {
                            if (err) {
                                return res.send({
                                    success: false,
                                    message: 'Something went wrong. Please try again'
                                });
                            }

                            var query = { template_name: templateName };
                            dbo.collection('email_templates').find(query).toArray(function (err, temp) {

                                if (err) {
                                    return res.send({
                                        success: false,
                                        message: 'Something went wrong. Please try again 2'
                                    });
                                }
                                var template = temp[0];
                                var subject = template.template_subject;
                                var htmlStr = template.template_content;
                                var customer_type = userData.customer_type == 1 ? 'New' : 'Existing';

                                var subjectHtml = subject.replace(/{SCHEME}/g, userData.registrationType);


                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, userData.registrationAccountName);
                                resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{SCHEME}/g, userData.registrationType);
                                resultHtml = resultHtml.replace(/{NAME}/g, userData.registrationAccountName);
                                resultHtml = resultHtml.replace(/{ACCOUNT_ID}/g, userData.registrationAccountId);
                                resultHtml = resultHtml.replace(/{EMAIL}/g, userData.registrationAccountEmail);
                                resultHtml = resultHtml.replace(/{CUS_TYPE}/g, customer_type);

                                var email = userData.registrationAccountEmail;
                                var sendMail = helpers.sendCustomeMail(userData.registrationAccountName, 'manigandan.g@officialgates.com', resultHtml, subjectHtml);
                                return res.send({
                                    success: true,
                                    message: msg
                                });
                                db.close();
                            });

                        });
                }

                if (deleteAction) {
                    var delquery = { _id: id };
                    dbo.collection('turnover_registration').deleteOne(delquery, function (err, sucess) {
                        if (err) {
                            return res.send({
                                success: false,
                                message: 'Request delete failed. Please try again!'
                            });
                        }
                        return res.send({
                            success: true,
                            message: msg
                        });
                        db.close();
                    });
                }


            });
        });



    });

    app.post('/api/user/user_interested', (req, res, next) => {

        const { body } = req;
        const {
            activePage,
            pageLimit,
            searchData,
            sortKey,
            sortOrder
        } = body;

        let skippage = pageLimit * (activePage - 1);
        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { user_intrested_deleted: 0 };
            if (searchData.searchBy == 'epiCode' && searchData.searchKey) {
                query.epiCode = parseInt(searchData.searchKey);
            } else if (searchData.searchKey && searchData.searchBy) {

                //  query[searchData.searchBy] = '/' + searchData.searchKey +'/i';
                query[searchData.searchBy] = new RegExp(searchData.searchKey, 'i');
                // query[searchData.searchBy] =  { '$regex' : '/.*'+searchData.searchKey+'./' , '$options':"i"}
            }
            var mysort = {};
            if(sortOrder == 'asc'){
                mysort[sortKey] = 1;
            }else{
                mysort[sortKey] = -1;
            }
            dbo.collection('user_intrested').find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    return res.send({
                        success: true,
                        records: result,

                    });
                }
                return res.send({
                    success: false,

                });

                db.close();
            });
        });

    });

    app.get('/api/user/user_interested_count', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { user_intrested_deleted: 0 };

            dbo.collection('user_intrested').find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.post('/api/user/updateuser_interested', (req, res, next) => {
        const { body } = req;
        const {
            action,
            _id,

        } = body;


        if (!action) {
            return res.send({
                success: false,
                message: 'Action missing'
            });
        } if (!_id) {
            return res.send({
                success: false,
                message: 'Id missing'
            });
        }


        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {

                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            try {
                var id = new require('mongodb').ObjectID(_id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid id'
                });
            }

            var query = { _id: id, user_intrested_deleted: 0 };

            dbo.collection('user_intrested').find(query).toArray(function (err, result) {

                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid id'
                    });
                }

                const userData = result[0];
                let updateData;
                let msg;
                if (action == 'Delete') {
                    updateData = { user_intrested_deleted: Date.now() };
                    msg = 'Record deleted successfully';

                }
                dbo.collection('user_intrested').findOneAndUpdate({
                    _id: userData._id,

                }, {
                        $set: updateData
                    }, null, (err, sessions) => {
                        if (err) {
                            return res.send({
                                success: false,
                                message: 'Something went wrong. Please try again'
                            });
                        }
                        return res.send({
                            success: true,
                            message: msg
                        });
                    });


                db.close();
            });
        });



    });



};
