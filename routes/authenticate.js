var express = require('express');
var jwt    = require('jsonwebtoken'); 
var config = require('../config/config');

var app = express();
app.config = config;
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
    try {
        var request = req.body;

        var username = request.username;
        var password = request.password;

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, username, password FROM users WHERE username = ?', username, function(err, rows, fields) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    
                    if (!rows.length) {
                        res.json({ success: false, message: 'Authentication failed. Username not found.' });
                    } else {
                        var returnUser = rows[0].username;
                        var returnPassword = rows[0].password;

                        if (returnUser != username) {
                            res.json({ success: false, message: 'Authentication failed. Wrong username.' });
                        } else {
                            if (returnPassword != password) {
                                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                            } else {
                                // if user is found and password is right
                                // create a token
                                //var token = jwt.sign({ issuer: 'coppia.co' }, config.secret.value);
                                var token = jwt.sign({ issuer: 'coppia.co' }, config.secret.value);
                                

                                res.json({ success: true, message: 'Enjoy your token!', token: token });
                            }   
                        }
                    }
                    
                    
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
