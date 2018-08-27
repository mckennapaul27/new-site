const config = require('../../../config/config');
const helpers = require('../../../config/helpers');
const MongoClient = require('mongodb').MongoClient;
const isDev = process.env.NODE_ENV !== 'production';
const nodemailer = require('nodemailer');
const collection = 'jos_users';
const bcrypt = require('bcrypt');
module.exports = (app) => {

    app.post('/api/account/create', (req, res, next) => {
        const { body } = req;
        const {
            name,
            last_name,
            username,
            password,
            usertype
        } = body;

        User.find({
            username: username, accountDeleted: 0
        }, (err, user) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            if (user.length > 0) {
                return res.send({
                    success: false,
                    message: 'Username already exists'
                });
            }
            const newUser = new User();
            newUser.name = name;
            newUser.last_name = last_name;
            newUser.username = username;
            newUser.password = newUser.generateHash(password);
            newUser.usertype = usertype;
            newUser.save((err, doc) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Something went wrong. Please try again'
                    });

                }
                return res.send({
                    success: true,
                    message: 'Success'
                });
            });


        });
    });
    app.post('/api/account/signin', (req, res, next) => {
        const { body } = req;
        const {
            username,
            password
        } = body;
        if (!username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
            });
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Please enter your password'
            });
        }
        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            console.log('db URL ',isDev ? config.db_dev : config.db);
            console.log('db',db);
            console.log('err',err);
            if (err) {

                return res.send({
                    success: false,
                    message: err
                });
            }
            var dbo = db.db(config.database);
            var query = { username: username, accountDeleted: 0, usertype: "Admin" };
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid username'
                    });
                }
                const userData = result[0];
                let accountLoginCount = userData.accountLoginCount;
                accountLoginCount++;
                if (!bcrypt.compareSync(password, userData.password)) {
                    return res.send({
                        success: false,
                        message: 'Invalid password'
                    });
                }

                dbo.collection(collection).findOneAndUpdate({
                    _id: userData._id,
                    accountDeleted: 0
                }, {
                        $set: {
                            accountLatestLoginTime: Date.now(),
                            accountLatestLoginIP: req.connection.remoteAddress,
                            accountLatestLoginUA: req.get('User-Agent'),
                            accountLoginCount: accountLoginCount
                        }
                    }, null, (err, sessions) => {

                    });

                userSessionUserId = userData._id;
                var sessionObj = { userId: userData._id, userLoggedTime: Date.now(), sessionDeleted: 0 };
                dbo.collection("usersessions").insertOne(sessionObj, function (err, doc) {

                    let result = doc[0];
                    var insertId = doc["ops"][0]["_id"];
                    if (err) {
                        return res.send({
                            success: false,
                            message: err
                        });
                    }
                    return res.send({
                        success: true,
                        message: 'Valid',
                        token: insertId,
                        login_id: userData._id.toString()
                    });

                });
                db.close();
            });
        });



    });

    app.get('/api/account/logout', (req, res, next) => {

        const { query } = req;
        const { token } = query;
        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var id = new require('mongodb').ObjectID(token);
            dbo.collection('usersessions').deleteOne({ _id: id }, function (err, result) {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Something went wrong. Please try again'
                    });
                }
                return res.send({
                    success: true,
                    message: 'Logout successfully!'
                });
            });
            db.close();
        });

    });

    app.get('/api/account/verify', (req, res, next) => {
        const { query } = req;
        const { token } = query;

        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {

            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);

            var id = new require('mongodb').ObjectID(token);
            var query1 = { _id: id, sessionDeleted: 0 };
            dbo.collection('usersessions').find(query1).toArray(function (err, sessions) {

                if (err) {
                    return res.send({
                        success: false,
                        message: 'Something went wrong. Please try again'
                    });
                }
                if (sessions.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Error: Invalid token '
                    });
                } else {
                    // DO ACTION
                    return res.send({
                        success: true,
                        message: 'Good'
                    });
                }
                db.close();
            });
        });

    });

    app.post('/api/account/forgot-password', (req, res, next) => {
        const { body } = req;

        const {
            username,
            password
        } = body;
        if (!username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
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
            var query = { username: username, accountDeleted: 0 };
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid username'
                    });
                }
                const userData = result[0];

                var query = { template_name: 'admin_forgot_password_email' };
                dbo.collection('email_templates').find(query).toArray(function (err, temp) {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Something went wrong. Please try again'
                        });
                    }
                    var template = temp[0];
                    var subject = template.template_subject;
                    var htmlStr = template.template_content;
                    var resultHtml = htmlStr.replace(/{USER_NAME}/g, userData.username);
                    resultHtml = resultHtml.replace(/{LOGO_PATH}/g, config.logo_path);
                    resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.site_name);
                    resultHtml = resultHtml.replace(/{VERIFY_URL}/g, config.base_url + 'change-password/' + userData._id);
                    var sendMail = helpers.sendCustomeMail(userData.username, userData.email, resultHtml, subject);
                    return res.send({
                        success: true,
                        message: 'Change password mail has been sent. Please check your mail inbox!'
                    });
                    db.close();
                });
            });

        });


    });

    app.post('/api/account/change-password/:id', (req, res, next) => {
        const { body } = req;

        const {
            username,
            password
        } = body;
        if (!username) {
            return res.send({
                success: false,
                message: 'Please enter your username'
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
            var query = { username: username, accountDeleted: 0 };
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid username'
                    });
                }
                const userData = result[0];

                var query = { template_name: 'admin_forgot_password_email' };
                dbo.collection('email_templates').find(query).toArray(function (err, temp) {

                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Something went wrong. Please try again'
                        });
                    }

                    var template = temp[0];
                    var subject = template.template_subject;
                    var htmlStr = template.template_content;

                    var resultHtml = htmlStr.replace(/{USER_NAME}/g, 'Mani');
                    resultHtml = resultHtml.replace(/{logo_path}/g, config.logo_path);
                    resultHtml = resultHtml.replace(/{SITE_NAME}/g, config.logo_path);
                    resultHtml = resultHtml.replace(/{VERIFY_URL}/g,config.base_url+'forgot-password');

                    helpers.sendCustomeMail(userData.username, userData.email, resultHtml, subject);
                    return res.send({
                        success: true,
                        message: 'Change password mail has been sent. Please check your mail inbox'
                    });
                    db.close();
                });
            });

        });


    });

    app.get('/api/account/verify_key', (req, res, next) => {
        const { query } = req;
        const { key } = query;




        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {

            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            try {
                var id = new require('mongodb').ObjectID(key);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid token '
                });
            }
            var query = { _id: id, accountDeleted: 0 };
            dbo.collection(collection).find(query).toArray(function (err, sessions) {

                if (err) {
                    return res.send({
                        success: false,
                        message: 'Something went wrong. Please try again'
                    });
                }
                if (sessions.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Error: Invalid token '
                    });
                } else {
                    // DO ACTION
                    return res.send({
                        success: true,
                        message: 'Success'
                    });
                }
                db.close();
            });
        });



    });

    app.post('/api/account/update-password', (req, res, next) => {
        const { body } = req;
        const {
            cpassword,
            password,
            _id
        } = body;

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



                dbo.collection(collection).findOneAndUpdate({
                    _id: userData._id,

                }, {
                        $set: {
                            password: helpers.generateHashPassword(password),
                        }
                    }, null, (err, sessions) => {
                        if (err) {
                            return res.send({
                                success: false,
                                message: 'Something went wrong. Please try again'
                            });
                        }
                        return res.send({
                            success: true,
                            message: 'Password changed successfully. Please login'
                        });
                    });


                db.close();
            });
        });



    });

};
