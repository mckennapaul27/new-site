const config = require('../../../config/config');
const helpers = require('../../../config/helpers');
const MongoClient = require('mongodb').MongoClient;
const isDev = process.env.NODE_ENV !== 'production';
const nodemailer = require('nodemailer');
const collection = 'jos_users';
const bcrypt = require('bcrypt');
module.exports = (app) => {

    app.post('/api/masterdata/emailtemplates', (req, res, next) => {

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
            if (sortOrder == 'asc') {
                mysort[sortKey] = 1;
            } else {
                mysort[sortKey] = -1;
            }
            dbo.collection('email_templates').find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
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

    app.get('/api/masterdata/emailtemplatescount', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = {};

            dbo.collection('email_templates').find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.get('/api/masterdata/emailtemprow_byid', (req, res, next) => {
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
            var query = { _id: id };
            dbo.collection('email_templates').find(query).toArray(function (err, userData) {

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



    app.post('/api/masterdata/update-emailtemplates', (req, res, next) => {
        const { body } = req;
        const {
            accountData,

            _id,
        } = body;


        if (!accountData.template_subject) {
            return res.send({
                success: false,
                message: 'Please enter template subject'
            });
        } if (!accountData.template_content) {
            return res.send({
                success: false,
                message: 'Please enter template content'
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
                var id = new require('mongodb').ObjectID(accountData._id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid id'
                });
            }

            var query = { _id: id };
            dbo.collection('email_templates').find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid user'
                    });
                }
                const userData = result[0];
                let updateData = {
                    template_subject: accountData.template_subject,
                    template_content: accountData.template_content,


                };
                dbo.collection('email_templates').findOneAndUpdate({
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


                        return res.send({
                            success: true,
                            message: 'Template updated successfully.'
                        });
                        db.close();

                    });




            });
        });



    });

    app.post('/api/masterdata/updateadmin_accounts', (req, res, next) => {
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

            dbo.collection('email_templates').find(query).toArray(function (err, result) {

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
                dbo.collection('email_templates').findOneAndUpdate({
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

    app.get('/api/masterdata/exportusers', (req, res, next) => {




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
            dbo.collection('email_templates').find(query).project(selectedColumn).toArray(function (err, result) {
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






};
