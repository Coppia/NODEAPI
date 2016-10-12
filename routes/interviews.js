var express = require('express');
var router = express.Router();

// GET INTERVIEWS
router.get('/', function(req, res, next) {
    try {
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, title, notes, create_user, create_datetime, update_user, update_datetime FROM interviews', function(err, rows, fields) {
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

// GET INTERVIEW BY interview_id
router.get('/:interview_id', function(req, res, next) {
    try {
        var request = req.params;
        
        var interview_id = request.interview_id;
        console.log(interview_id);

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, title, notes, create_user, create_datetime, update_user, update_datetime FROM interviews WHERE id = ?', [interview_id], function(err, rows, fields) {
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

// CREATE INTERVIEW
router.post('/', function(req, res, next) {
    try {
        var request = req.body;
        console.log(request);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO interviews SET ?";
                var insertValues = {
                    "title" : request.title,
                    "notes" : request.notes,
                    "create_user" : request.create_user,
                    "update_user" : request.create_user
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var interview_id = result.insertId;
                    res.json({"interview_id":interview_id});
                });
            }
        });
    }
    catch(ex) {
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

// CREATE INTERVIEW CUSTOMER
router.post('/interview_customer/', function(req, res, next) {
    try {
        var request = req.body;
        console.log(request);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO interview_customer SET ?";
                var insertValues = {
                    "interview_id" : request.interview_id,
                    "customer_id" : request.customer_id
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var interview_customer_id = result.insertId;
                    res.json({"interview_customer_id":interview_customer_id});
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
