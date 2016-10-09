var express = require('express');
var router = express.Router();

// GET CUSTOMERS
router.get('/', function(req, res, next) {
    try {
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, first_name, last_name, email, image_link, create_user, create_datetime, update_user, update_datetime FROM customers', function(err, rows, fields) {
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
        var customerId = req.param('customer_id');

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, first_name, last_name, email, image_link, create_user, create_datetime, update_user, update_datetime FROM customers WHERE id = ?', customerId, function(err, rows, fields) {
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
        var reqObj = req.body;
        console.log(reqObj);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO customers SET ?";
                var insertValues = {
                    "first_name" : reqObj.first_name,
                    "last_name" : reqObj.last_name,
                    "email" : reqObj.email,
                    "image_link" : reqObj.image_link,
                    "create_user" : reqObj.create_user,
                    "update_user" : reqObj.create_user
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var CustomerId = result.insertId;
                    res.json({"CustomerId":CustomerId});
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
