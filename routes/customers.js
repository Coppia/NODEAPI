var express = require('express');
var jwt    = require('jsonwebtoken'); 
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

// GET CUSTOMERS
router.get('/', function(req, res, next) {
    try {
        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query(`SELECT  customers.id, 
                                    customers.first_name, 
                                    customers.last_name, 
                                    customers.email, 
                                    customers.image_link, 
                                     CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    customers.create_datetime as created_date, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    customers.update_datetime as updated_date
                            FROM    customers
                            JOIN	users as create_users
                                ON	customers.create_user = create_users.id
                            JOIN	users as update_users
                                ON	customers.update_user = update_users.id;`, function(err, rows, fields) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    res.json(rows);
                });
            }
        });
    }
    catch(ex) {
        console.error("Internal error: ", ex);
        return next(ex);
    }
});

// GET CUSTOMERS BY :id
router.get('/:customer_id', function(req, res, next) {
    try {
        var request = req.params;
        var customer_id = request.customer_id;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query(`SELECT  customers.id, 
                                    customers.first_name, 
                                    customers.last_name, 
                                    customers.email, 
                                    customers.image_link, 
                                     CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    customers.create_datetime as created_date, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    customers.update_datetime as updated_date
                            FROM    customers
                            JOIN	users as create_users
                                ON	customers.create_user = create_users.id
                            JOIN	users as update_users
                                ON	customers.update_user = update_users.id WHERE id = ?`, customer_id, function(err, rows, fields) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    res.json(rows);
                });
            }
        });
    }
    catch(ex) {
        console.error("Internal error: ", ex);
        return next(ex);
    }
});

// CREATE CUSTOMER
router.post('/', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO customers SET ?";
                var insertValues = {
                    "first_name" : request.first_name,
                    "last_name" : request.last_name,
                    "email" : request.email,
                    "image_link" : request.image_link,
                    "create_user" : request.create_user,
                    "create_datetime" : currdatetime,
                    "update_user" : request.create_user,
                    "update_datetime" : currdatetime
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
            
                    var customer_id = result.insertId;
                    res.json({"customer_id":customer_id});
                });
            }
        });
    }
    catch(ex) {
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

// UPDATE CUSTOMER BY customer_id
router.put('/:customer_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var customer_id = req.params.customer_id;
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var updateSql = "UPDATE customers SET ? WHERE ?";
                var updateValues = {
                    "first_name" : request.first_name,
                    "last_name" : request.last_name,
                    "email" : request.email,
                    "image_link" : request.image_link,
                    "update_user" : request.update_user,
                    "update_datetime" : currdatetime
                };
                var whereValue = {
                    "id" : customer_id
                };

                var query = conn.query(updateSql, [updateValues, whereValue], function(err, result) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    res.json(result);
                });
            }
        });
    }
    catch(ex) {
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

//DELETE CUSTOMER BY customer_id
router.delete('/:customer_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var customer_id = req.params.customer_id;
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var deleteSql1 = "DELETE FROM interview_customer WHERE ?";
                
                var whereValue = {
                    "customer_id" : customer_id
                };

                var query = conn.query(deleteSql1, whereValue, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }

                    var deleteSql2 = "DELETE FROM customers WHERE ?";
                
                    var whereValue = {
                        "id" : customer_id
                    };

                    var query2 = conn.query(deleteSql2, whereValue, function(err, result) {
                        conn.release();

                        if (err) {
                            console.error('SQL Error: ' + err);
                            return next(err);
                        }

                        res.json(result);
                    });
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
