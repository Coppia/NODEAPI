var express = require('express');
var jwt    = require('jsonwebtoken'); 
var bcrypt = require('bcrypt-nodejs');

var router = express.Router();

const saltRounds = 10;

/* GET JWT TOKEN FROM USERNAME - PASSWORD */
router.get('/', function(req, res, next) {
    try {
        var secret = req.app.get('jwtkey');
        var request = req.body;

        var username = request.username;
        var password = request.password;

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return res.json({ success: false, message: 'Failed to connect to MySQL.' });   
                //return next(err);
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
                            if (!bcrypt.compareSync(password, returnPassword)) {
                                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                            } else {
                                var token = jwt.sign({
                                    iss:  'coppia',
                                    agent: req.headers['user-agent'],
                                    exp:   Math.floor(new Date().getTime()/1000) + 7*24*60*60 // Note: in seconds!
                                }, secret);  // secret is defined in the environment variable JWT_SECRET
                                
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

router.post('/', function(req, res, next) {
    try {
        var request = req.body;

        var username = request.username;
        var password = request.password;

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return res.json({ success: false, message: 'Failed to connect to MySQL.' });   
                //return next(err);
            }
            else {
                var salt = bcrypt.genSaltSync(saltRounds);
                var hash = bcrypt.hashSync(password, salt);

                var insertSql = "INSERT INTO users SET ?";
                var insertValues = {
                    "username" : username,
                    "password" : password
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
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
