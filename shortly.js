var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators) //?????
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/',
function(req, res) {
  res.render('index');
});

app.get('/create',
function(req, res) {
  res.render('index');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      console.log('found ', found)
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.get('/login',
function(req, res) {
  res.render('login');
});

//
//actually store the stuff
//and/or create a session

app.post('/login',
function(req, res) {
  // console.log(req.body)
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username/*, password: password*/ }).fetch().then(function(found) {
    if (found) {
      console.log("found === truthy: ", found.attributes)
      //username exists, check password
      return found;
    } else {
        console.log("inside the else")
        console.log("That username doesn't exist: ", username);
        return res.send(404, ("The username \'" + username + "\' doesn't exist. Please sign up or try again."));
        //"you can't login, you need to sign up or try again."
    }
  }).then(function(found){


      // var encrypt = function(toEncrypt){
      //   bcrypt.hash(toEncrypt, 10, function(err, hash) {
      //       // Store hash in your password DB.
      //       if (err) {console.log("hashing the password failed, see user.js")}
      //       else {return hash}
      //     });
      // }

      console.log(res.writable, "res?")
      bcrypt.compare(password, found.attributes.password, function(err, bool) {
          console.log(bool)
          if (bool){
            console.log("username and password are valid. login granted.")
            console.log("res", res.writable, " + bool is true")
            // res.cookie('cart', { items: [1,2,3] });
            res.send(200, "yo")
          }
          else {
            res.send(404, "password is wrong.")
          }
      })
  });
});

app.post('/signup',
function(req, res) {
  // console.log(req.body)
  var username = req.body.username;
  var password = req.body.password;
  loginObject = {username: username, password: password}

  new User({ username: username/*, password: password*/ }).fetch().then(function(found) {
    if (found) {
      console.log("found === truthy: ", found.attributes)
      //username exists, check password
      res.send(404, "that username is taken, please try another.")
      return found;
    } else {
        loginObject.trigger('creating', function(bool){
          console.log("trigger worked? ", bool)
        })
        console.log("inside the else")
        console.log("That username doesn't exist: ", username);
        return res.send(404, ("The username \'" + username + "\' doesn't exist. Please sign up or try again."));
        //"you can't login, you need to sign up or try again."
    }
  }).then(function(found){

      // var encrypt = function(toEncrypt){
      //   bcrypt.hash(toEncrypt, 10, function(err, hash) {
      //       // Store hash in your password DB.
      //       if (err) {console.log("hashing the password failed, see user.js")}
      //       else {return hash}
      //     });
      // }

      console.log(res.writable, "res?")
      bcrypt.compare(password, found.attributes.password, function(err, bool) {
          console.log(bool)
          if (bool){
            console.log("username and password are valid. login granted.")
            console.log("res", res.writable, " + bool is true")
            // res.cookie('cart', { items: [1,2,3] });
            res.send(200, "yo")
          }
          else {
            res.send(404, "password is wrong.")
          }
      })
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
