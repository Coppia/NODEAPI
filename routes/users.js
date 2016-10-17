var express = require('express');
var jwt    = require('jsonwebtoken'); 
var bcrypt = require('bcrypt-nodejs');

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

// CREATE USER
router.post('/', function(req, res, next) {
    try {
        var request = req.body;

        var username = request.username;
        var password = request.password;

        var hash = bcrypt.hashSync(password);

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO users SET ?";
                var insertValues = {
                    "username" : username,
                    "password" : hash
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
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
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

module.exports = router;
