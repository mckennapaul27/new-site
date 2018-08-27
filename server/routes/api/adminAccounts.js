const config = require('../../../config/config');
const helpers = require('../../../config/helpers');
const MongoClient = require('mongodb').MongoClient;
const isDev = process.env.NODE_ENV !== 'production';
const nodemailer = require('nodemailer');
const collection = 'jos_users';
const bcrypt = require('bcrypt');
module.exports = (app) => {

    app.post('/api/admin/create', (req, res, next) => {
        const { body } = req;
        const {
            name,
            last_name,
            username,
            email,
            password,
            cpassword,
            accessPrivilege,
            accessModule,
            sendMail
        } = body;

        if (!name) {
            return res.send({
                success: false,
                message: 'Please enter your name'
            });
        } if (!username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
            });
        } if (!email) {
            return res.send({
                success: false,
                message: 'Please enter your email'
            });
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Please enter your password'
            });
        }
        if (!cpassword) {
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
            var unamequery = { username: username, accountDeleted: 0 ,usertype:"Admin"};
            dbo.collection(collection).find(unamequery).toArray(function (err, usernameRes) {
                if (usernameRes.length > 0) {
                    return res.send({
                        success: false,
                        message: 'Username already exist!'
                    });
                }
                // Check Email if already exist
                var emailquery = { email: email, accountDeleted: 0 ,usertype:"Admin"};
                dbo.collection(collection).find(emailquery).toArray(function (err, emailRes) {
                    if (emailRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Email address already exist!'
                        });
                    }

                    // Else create a new account
                    accountData = {
                        epiCode:0,
                        name: name,
                        username: username,
                        last_name: '',
                        email: email,
                        password: helpers.generateHashPassword(password),
                        usertype: 'Admin',
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
                        accountCountry: "",
                        accountPhone: "",
                        accountAddress: "",
                        accountGender: "",
                        accountDob: "",
                        bankAccountName: "",
                        bankAccountSortCode: "",
                        bankAccountNumber: "",
                        accountPaypalEmail: "",
                        accountSkrillEmail: "",
                        accountNetellerEmail: "",
                        accountReferrence: "",
                        referred_by: "",
                        referrdapp_by: "",
                        accountActivated: 0,
                        accessPrivilege: accessPrivilege,
                        accessModule: accessModule,
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
                        paymentStatus: "",
                        vipmail: "",
                        uservip: "",
                        cutodds_auth: "",
                        user_oauth_provider: "",
                        user_oauth_id: "",
                        is_super_Admin: 0,
                    };

                    dbo.collection(collection).insertOne(accountData, function (err, doc) {

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
                                var resultHtml = htmlStr.replace(/{USER_NAME}/g, username);
                                resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                                resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                                resultHtml = resultHtml.replace(/{EMAIL}/g, email);
                                resultHtml = resultHtml.replace(/{USER_TYPE}/g, 'Admin');
                                resultHtml = resultHtml.replace(/{PWD}/g, password);
                                resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.base_url + 'admin/');
                                var sendMail = helpers.sendCustomeMail(username, 'manigandan.g@officialgates.com', resultHtml, subject);
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


    app.post('/api/admin/accouts', (req, res, next) => {

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
            var query = { accountDeleted: 0, is_super_Admin: 0 ,usertype:"Admin"};
            if (searchData.accountStatus == 'Enabled') {
                query.block = 0;
            } if (searchData.accountStatus == 'Disabled') {
                query.block = 1;
            }
            if (searchData.searchKey && searchData.searchBy) {

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

    app.get('/api/admin/accoutsCount', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { accountDeleted: 0, is_super_Admin: 0 ,usertype:"Admin"};
            var doCount = dbo.collection(collection).count(query);
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

    app.get('/api/admin/getaccountby_id', (req, res, next) => {
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
                    message: 'Error: Invalid token '
                });
            }
            var query = { _id: id, accountDeleted: 0 ,usertype:"Admin"};
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
                        message: 'Error: Invalid token  '
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

    app.post('/api/admin/update-myaccount', (req, res, next) => {
        const { body } = req;
        const {
            name,
            username,
            email,
            cpassword,
            password,
            _id,
            changePassword
        } = body;


        if (!name) {
            return res.send({
                success: false,
                message: 'Please enter your name'
            });
        } if (!username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
            });
        } if (!email) {
            return res.send({
                success: false,
                message: 'Please enter your email'
            });
        }
        if (changePassword) {
            if (!password) {
                return res.send({
                    success: false,
                    message: 'Please enter your password'
                });
            }
            if (!cpassword) {
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
                var id = new require('mongodb').ObjectID(_id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid user'
                });
            }

            var query = { _id: id, accountDeleted: 0 ,usertype:"Admin"};
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid user'
                    });
                }
                var unamequery = { username: username, accountDeleted: 0,usertype:"Admin", _id: { '$ne': id } };
                dbo.collection(collection).find(unamequery).toArray(function (err, usernameRes) {
                    if (usernameRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Username already exist!'
                        });
                    }
                });

                var emailquery = { email: email, accountDeleted: 0,usertype:"Admin", _id: { '$ne': id } };
                dbo.collection(collection).find(emailquery).toArray(function (err, usernameRes) {
                    if (usernameRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Email address already exist!'
                        });
                    }
                });

                const userData = result[0];
                let updateData = { name: name, username: username, email: email };
                if (changePassword) {
                    updateData = { name: name, username: username, email: email, password: helpers.generateHashPassword(password) };
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
                            message: 'Account updated successfully.'
                        });
                    });


                db.close();
            });
        });



    });

    app.post('/api/admin/update-accounts', (req, res, next) => {
        const { body } = req;
        const {
            name,
            last_name,
            username,
            email,
            password,
            cpassword,
            accessPrivilege,
            accessModule,
            emailChecked,
            passChecked,
            _id,
        } = body;


        if (!name) {
            return res.send({
                success: false,
                message: 'Please enter your name'
            });
        } if (!username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
            });
        } if (!email) {
            return res.send({
                success: false,
                message: 'Please enter your email'
            });
        }
        if (passChecked) {
            if (!password) {
                return res.send({
                    success: false,
                    message: 'Please enter your password'
                });
            }
            if (!cpassword) {
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
                var id = new require('mongodb').ObjectID(_id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid user'
                });
            }

            var query = { _id: id, accountDeleted: 0 ,usertype:"Admin"};
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid user'
                    });
                }
                var unamequery = { username: username, accountDeleted: 0,usertype:"Admin", _id: { '$ne': id } };
                dbo.collection(collection).find(unamequery).toArray(function (err, usernameRes) {
                    if (usernameRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Username already exist!'
                        });
                    }
                    var emailquery = { email: email, accountDeleted: 0,usertype:"Admin", _id: { '$ne': id } };
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
                            name: name, username: username, email: email, accessPrivilege: accessPrivilege,
                            accessModule: accessModule
                        };
                        if (passChecked) {
                            updateData = {
                                name: name, username: username, email: email,
                                password: helpers.generateHashPassword(password), accessPrivilege: accessPrivilege,
                                accessModule: accessModule
                            };
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
                                        resultHtml = resultHtml.replace(/{USER_TYPE}/g, 'Admin');
                                        resultHtml = resultHtml.replace(/{PWD}/g, password);
                                        resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.base_url + 'admin/');
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

    app.post('/api/admin/updateadmin_accounts', (req, res, next) => {
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



};
