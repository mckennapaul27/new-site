//const mongoose = require('mongoose');

const MongoClient = require('mongodb').MongoClient, assert = require('assert');

const UserSessionSchema = new MongoClient.Schema({
  userId: {
    type: String,
    default: 0
  }, userLoggedTime: {
    type: Date,
    default: Date.now()
  }, sessionDeleted: {
    type: Number,
    default: 0
  }
});

module.exports = MongoClient.model('UserSession', UserSessionSchema);
