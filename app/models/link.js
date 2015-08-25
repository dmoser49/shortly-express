var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');

var Link = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  clicks: function() {
    return this.hasMany(Click);
  },
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      console.log(this, " creation!")
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url')); // ???
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;

shasum = function(stuff){/*
  returns an object with a method called update
  that returns hashed stuff
*/}

shasum.update = function(/*reference to something in db*/){
  //returns hashed stuff
}

