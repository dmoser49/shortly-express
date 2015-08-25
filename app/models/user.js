var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  //wheeeeeee

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      console.log(model.get('password'), " model.get(password)")
      bcrypt.hash(model.get('password'), 10, function(err, hash) {
        // Store hash in your password DB.
        if (err) {console.log("hashing the password failed, see user.js")}
        else {
          model.set('password', hash)
          console.log("hash was theoretically successful?")
          return {hashed: true, hash: hash};
        }
      });
      // shasum.update(model.get('username')); //why is this necessary?
    });
  }
});

module.exports = User;




//bad:
exports.encrypt = function(toEncrypt){
    bcrypt.hash(toEncrypt, 10, function(err, hash) {
        // Store hash in your password DB.
        if (err) {console.log("hashing the password failed, see user.js")}
        else {return hash}
      });
  }
