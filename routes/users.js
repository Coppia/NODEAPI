var express = require('express');
var jwt    = require('jsonwebtoken'); 
var bcrypt = require('bcrypt-nodejs');
var pool = require('../config/conn');

var router = express.Router();

router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    var secret = req.app.get('jwtkey');

    // verifies secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('USERS: respond with a resource');
});

// CREATE NEW USER
router.post('/', function(req, res, next) {
    try {
        var request = req.body;

        var username = request.username;
        var password = request.password;
        var first_name = request.first_name;
        var last_name = request.last_name;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err); 
                return next(err);
            }
            else {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(password, salt);

                var insertSql = "INSERT INTO users SET ?";
                var insertValues = {
                    "username" : username,
                    "password" : hash,
                    "first_name" : first_name,
                    "last_name" : last_name
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    conn.release();
                    
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    var user_id = result.insertId;
                    
                    res.json({"user_id":user_id});
                });
            }
        });
    }
    catch(ex) {
        console.error("Internal error: ", ex);
        return next(ex);
    }
});

module.exports = router;
