var express = require('express');
var jwt    = require('jsonwebtoken'); 
var bcrypt = require('bcrypt-nodejs');
var pool = require('../config/conn');

var router = express.Router();

const saltRounds = 10;

/* GET JWT TOKEN FROM USERNAME - PASSWORD */
router.post('/', function(req, res, next) {
    try {
        var secret = req.app.get('jwtkey');
        var request = req.body;

        var username = request.username;
        var password = request.password;

        pool.getConnection(function(err, conn) {
            if (err) {
                res.json(
                    {
                        "success" : false,
                        "message" : "SQL Connection Error: " + err
                    }
                );
                // console.error('SQL Connection error: ', err);   
                // return next(err);
            }
            else {
                conn.query('SELECT id, username, password, first_name, last_name FROM users WHERE username = ?', username, function(err, rows, fields) {
                    conn.release();

                    if (err) {
                        res.json(
                            {
                                "success" : false,
                                "message" : "SQL Error: " + err
                            }
                        );
                        // console.error('SQL Error: ', err);
                        // return next(err);
                    }
                    
                    if (!rows.length) {
                        res.json({ success: false, message: 'Authentication failed. Username not found.' });
                    } else {
                        var returnUser = rows[0].username;
                        var returnPassword = rows[0].password;
                        var user_id = rows[0].id;
                        var first_name = rows[0].first_name;
                        var last_name = rows[0].last_name;

                        if (returnUser != username) {
                            res.json({ success: false, message: 'Authentication failed. Wrong username.' });
                        } else {
                            if (!bcrypt.compareSync(password, returnPassword)) {
                                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                            } else {
                                var token = jwt.sign({
                                    iss:  'coppia',
                                    agent: req.headers['user-agent'],
                                    exp:   Math.floor(new Date().getTime()/1000) + 7*24*60*60 // Note: in seconds!
                                }, secret);  // secret is defined in the environment variable JWT_SECRET
                                
                                res.json({ 
                                    success: true, 
                                    token: token,
                                    id:  user_id,
                                    username: returnUser,
                                    first_name: first_name,
                                    last_name: last_name
                                });
                            }   
                        }
                    }  
                });
            }
        });
    }
    catch(ex) {
        res.json(
            {
                "success" : false,
                "message" : "Internal Error: " + ex
            }
        );
        // console.error("Internal error: ", ex);
        // return next(ex);
    }
});

module.exports = router;
