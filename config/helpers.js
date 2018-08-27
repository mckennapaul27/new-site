const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Helper functions
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat('../', ...args));
}

function sendCustomeMail(toname, to, html, subject) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test@officialgates.com',
      pass: 'chennai@999333'
    }
  });
  var mailOptions = {
    from: ' "Couponarbitrage" <gunasekar.k@officialgates.com>',
    to: to,
    subject: subject,
    html: html
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return false;
    } else {
      //console.log('Email sent: ' + info.response);
      return true;
    }
  });

}

function generateHashPassword(password) {
  return  bcrypt.hashSync(password, 10);
  
  bcrypt.hash(password, 10, function (err, bcryptedPassword) {
    return bcryptedPassword;
  });

}
exports.root = root;
exports.sendCustomeMail = sendCustomeMail;
exports.generateHashPassword = generateHashPassword;