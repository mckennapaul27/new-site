const config = require('../../../config/config');
const helpers = require('../../../config/helpers');
const MongoClient = require('mongodb').MongoClient;
const isDev = process.env.NODE_ENV !== 'production';
const nodemailer = require('nodemailer');
const collection = 'jos_users';
const bcrypt = require('bcrypt');
module.exports = (app) => {


    app.post('/api/menumanger/create', (req, res, next) => {
        const { body } = req;
        const {
            formData,

        } = body;

        if (!formData.title) {
            return res.send({
                success: false,
                message: 'Please enter the title'
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

            var unamequery = { title: formData.title, menuTypeDeleted: 0 };
            dbo.collection('jos_menu_types').find(unamequery).toArray(function (err, usernameRes) {
                if (usernameRes.length > 0) {
                    return res.send({
                        success: false,
                        message: 'Menu title already exist!'
                    });
                }



                // Else create a new one
                accountData = {
                    menutype: formData.menutype,
                    title: formData.title,
                    description: formData.description,
                    menuDefault: 0,
                    menuTypeDisabled: 0,
                    menuTypeDeleted: 0,

                };

                dbo.collection('jos_menu_types').insertOne(accountData, function (err, doc) {

                    let result = doc[0];
                    var insertId = doc["ops"][0]["_id"];
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Something went wrong. Please try again 1'
                        });
                    }
                    return res.send({
                        success: true,
                        message: 'Menu created successfully.'
                    });
                    db.close();

                });
            });

        });

    });

    app.post('/api/menumanger/updatemenu', (req, res, next) => {
        const { body } = req;
        const {
            formData,

        } = body;

        if (!formData.title) {
            return res.send({
                success: false,
                message: 'Please enter the title'
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
                var id = new require('mongodb').ObjectID(formData._id);
            } catch (err) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid user'
                });
            }

            var query = { _id: id, menuTypeDeleted: 0 };
            dbo.collection('jos_menu_types').find(query).toArray(function (err, result) {
                if (err) throw err;

                if (result.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Invalid user'
                    });
                }
                var unamequery = { title: formData.title, menuTypeDeleted: 0, _id: { '$ne': id } };
                dbo.collection('jos_menu_types').find(unamequery).toArray(function (err, usernameRes) {
                    if (usernameRes.length > 0) {
                        return res.send({
                            success: false,
                            message: 'Menu title already exist!'
                        });
                    }
                });
                const userData = result[0];
                let updateData = {
                    menutype: formData.menutype,
                    title: formData.title,
                    description: formData.description,
                };

                dbo.collection('jos_menu_types').findOneAndUpdate({
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


    app.post('/api/menumanger/menus', (req, res, next) => {

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
            var query = { menuTypeDeleted: 0 };
            if (searchData.accountStatus == 'Enabled') {
                query.menuTypeDisabled = 0;
            } if (searchData.accountStatus == 'Disabled') {
                query.menuTypeDisabled = 1;
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
            dbo.collection('jos_menu_types').find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
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

    app.get('/api/menumanger/menuscount', (req, res, next) => {



        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { menuTypeDeleted: 0 };

            dbo.collection('jos_menu_types').find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.get('/api/menumanger/menusrow_byid', (req, res, next) => {
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
            var query = { _id: id, menuTypeDeleted: 0 };
            dbo.collection('jos_menu_types').find(query).toArray(function (err, userData) {

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

    app.post('/api/menumanger/updatemenus_status', (req, res, next) => {
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

            var query = { _id: id, menuTypeDeleted: 0 };

            dbo.collection('jos_menu_types').find(query).toArray(function (err, result) {

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
                    updateData = { menuTypeDisabled: 0 };
                    msg = 'Account enabled successfully';
                } else if (action == 'disable') {
                    updateData = { menuTypeDisabled: 1 };
                    msg = 'Account disbled successfully';
                } else if (action == 'Delete') {
                    updateData = { menuTypeDeleted: Date.now() };
                    msg = 'Account deleted successfully';

                }
                dbo.collection('jos_menu_types').findOneAndUpdate({
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

    app.post('/api/menumanger/submenuslist', (req, res, next) => {

        const { body } = req;
        const {
            menuId,
            activePage,
            pageLimit,
            searchData,
            parentMenu,
            submenuId,
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
            var query = { menuDeleted: 0, menutypeid: menuId };
            if (searchData.accountStatus == 'Enabled') {
                query.menuDisabled = 0;
            } if (searchData.accountStatus == 'Disabled') {
                query.menuDisabled = 1;
            }
            if (searchData.searchKey && searchData.searchBy) {

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
            dbo.collection('jos_menu').find(query).skip(skippage).limit(pageLimit).sort(mysort).toArray(function (err, result) {
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



    app.post('/api/menumanger/submenuscount', (req, res, next) => {

        const { body } = req;
        const {
            menuId,


        } = body;


        MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Something went wrong. Please try again'
                });
            }
            var dbo = db.db(config.database);
            var query = { menuDeleted: 0, menutypeid: menuId };

            dbo.collection('jos_menu').find(query).count(function (err, result) {
                if (err) throw err;
                return res.send({
                    success: true,
                    totalCount: result,

                })
                db.close();
            });

        });

    });

    app.post('/api/menumanger/updatesubmenus_status', (req, res, next) => {
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

            var query = { _id: id, menuDeleted: 0 };

            dbo.collection('jos_menu').find(query).toArray(function (err, result) {

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
                if (action == 'enable') {
                    updateData = { menuDisabled: 0 };
                    msg = 'Account enabled successfully';
                } else if (action == 'disable') {
                    updateData = { menuDisabled: 1 };
                    msg = 'Account disbled successfully';
                } else if (action == 'Delete') {
                    updateData = { menuDeleted: Date.now() };
                    msg = 'Account deleted successfully';

                }
                dbo.collection('jos_menu').findOneAndUpdate({
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

    app.post('/api/menumanger/allsubmenuslist', (req, res, next) => {

        const { body } = req;
        const {
            menuId,
            parentMenu,
            submenuId

        } = body;

        (async () => {

            const client = await MongoClient.connect(isDev ? config.db_dev : config.db,
                { useNewUrlParser: true });
            var dbo = client.db(config.database);
            try {

                var query = { menuDeleted: 0, menutypeid: menuId, parent: "1" };
                var menusRes = [];
                // var mysort = { name: 1 };
                //var menusRes = await dbo.collection('jos_menu').find(query).sort(mysort).project({ 'name': true }).toArray();

                console.log('1');
                dbo.collection('jos_menu').find(query).forEach(function (item, err) {
                    console.log('2');
                    var parentId = new require('mongodb').ObjectID(item._id);
                    var subquery = { menuDeleted: 0, menutypeid: menuId, parent: parentId.toString() };
                    var mysort = { name: 1 };
                    var subMenus = dbo.collection('jos_menu').find(subquery).sort(mysort).project({ 'name': true }).toArray();
                    item.submenus = subMenus;
                    finalResults.push(item);

                });
                console.log('3');

                var finalResults = [];
                if (menusRes.length > 0) {

                    menusRes.forEach(function (item) {

                        var parentId = new require('mongodb').ObjectID(item._id);
                        var subquery = { menuDeleted: 0, menutypeid: menuId, parent: parentId.toString() };
                        var mysort = { name: 1 };
                        setTimeout(() => {
                            var submenus = dbo.collection('jos_menu').find(subquery).sort(mysort).project({ 'name': true })
                                .toArray().then(function (submenusRes) {

                                    item.subMenu = submenusRes;
                                    finalResults.push(item);
                                });
                        }, 300);


                    });
                    console.log('1 1 --', finalResults);
                }

            } finally {
                // client.close();
            }


        })()
            .catch(err => console.error(err));

    });




};

function getSubmenus(menuId, parentId) {
    MongoClient.connect(isDev ? config.db_dev : config.db, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db(config.database);
        try {
            var parentId = new require('mongodb').ObjectID(item._id);
        } catch (err) {

        }
        var subquery = { menuDeleted: 0, menutypeid: menuId, parent: parentId };
        dbo.collection('jos_menu').find(subquery).project({ 'name': true }).toArray(function (err, subMenuRes) {


            if (subMenuRes.length > 0) {
                submenuresults = subMenuRes;
            } else {
                submenuresults = {};
            }
            return submenuresults;

        });
    });
}
