// All logic interactions taking info from request and responding from db
var jwt = require('jwt-simple');
var Models = require('./db/models.js');
var User = Models.User;
var createUser = require('./db/queries/createUser.js');
var buildUserObj = require('./db/queries/buildUserObj.js');
var getRelatedUserIds = require('./db/queries/getRelatedUserIds.js');
var Promise = require('bluebird');


var secret = 'INSERTWITTYSECRETHERE';

module.exports = {

  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var userModel;

    User.forge({
      username: username
    })
      .fetch()
      .then(function (user) {
        if (!user) {
          throw new Error('User does not exist');
        }
        //in order to take advantage of chain promises, need to save found user in higher scope
        userModel = user;
        return user.comparePasswords(password);
      })
      .then(function (passwordsMatch) {
        if (!passwordsMatch) {
          throw new Error('Incorrect password');
        }
        var token = jwt.encode(userModel, secret);
        res.json({ token: token });
      })
      .catch(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    createUser(req.body, next)
      .then(function (user) {
        if (!user) {
          throw new Error('User creation failed');
        }
        res.json({
          token: jwt.encode(user, secret)
        });
      })
      .catch(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header if any
    var token = req.headers['x-access-token'];

    if (!token) {
      throw new Error('No token');
    }
    // then decode the token, which will end up being the user object
    var user = jwt.decode(token, secret);
    // check to see if that user exists in the database
    // "User.forge" is syntactic sugar for "new User"
    User.forge({
      username: user.username
    })
      .fetch()
      .then(function (foundUser) {
        if (foundUser) {
          next(); //if everything goes well, pass req to next handler (in server config)
        } else {
          res.send(401);
        }
      })
      .catch(function (error) {
        next(error);
      });

  },

  getMatchingUsers: function (req, res, next) {

    var token = req.headers['x-access-token'];
    var user = jwt.decode(token, secret);

    //create new user for search
    User.forge({
      username: user.username
    })
      .fetch({ //find in db with related offers
        withRelated: 'offers'
      })
      .then(function (foundUser) {
        // convert bookshelf found user into array of offer strings
        return foundUser.related('offers').map(function (offer) {
          return offer.get('skill');
        });
      })
    // convert array of offers to array of user id's that want to learn what user has to offer
    .then(function (offers) {
      console.log('offers=', offers);
      return getRelatedUserIds(offers);
    })
    // convert user_ids into user objects to send,
    // because JSON format for send different than JSON format from Bookshelf objects
    // TODO: change to send data from bookshelf in the same format it
    // comes out instead of converting to something else
    .then(function (userIds) {
      return Promise.all(
        userIds.map(function (id) {
          return buildUserObj(id);
        })
      );
    })
      .then(function (users) {
        console.log(users);
        res.json(users);
      })
      .catch(function (err) {
        next(err);
      });

  },

  getCurrentUser: function (req, res, next) {

    var token = req.headers['x-access-token'];
    var user = jwt.decode(token, secret);

    //convert bookshelf user object to expected JSON format for send
    //TODO: use bookshelf format for send instead
    buildUserObj(user.id).then(function (builtUserObj) {
      res.json(builtUserObj);
    });
  }

};
