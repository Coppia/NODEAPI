var express = require('express');
var jwt    = require('jsonwebtoken'); 

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

// GET INTERVIEWS
router.get('/', function(req, res, next) {
    try {
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query(`SELECT 	interviews.id AS interview_id, 
                                    interviews.title, 
                                    interviews.notes, 
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    interviews.create_datetime as created_date, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    interviews.update_datetime as updated_date
                            FROM 	interviews
                            JOIN	users as create_users
                                ON	interviews.create_user = create_users.id
                            JOIN	users as update_users
                                ON	interviews.update_user = update_users.id;`, function(err, rows, fields) {
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

// POST INTERVIEW
router.post('/', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var request = req.body;
      
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
                    "create_datetime" : currdatetime,
                    "update_user" : request.create_user,
                    "update_datetime" : currdatetime
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                  
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

// POST INTERVIEW CUSTOMER
router.post('/interview_customer/', function(req, res, next) {
    try {
        var request = req.body;
      
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

// UPDATE INTERVIEW BY interview_id
router.put('/:interview_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var interview_id = req.params.interview_id;
        var request = req.body;

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var updateSql = "UPDATE interviews SET ? WHERE ?";
                var updateValues = {
                     "title" : request.title,
                    "notes" : request.notes,
                    "update_user" : request.update_user,
                    "update_datetime" : currdatetime
                };
                var whereValue = {
                    "id" : interview_id
                };

                var query = conn.query(updateSql, [updateValues, whereValue], function(err, result) {
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

//DELETE IDEA BY idea_id
router.delete('/:interview_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var interview_id = req.params.interview_id;
        var request = req.body;

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var deleteSql1 = "DELETE FROM interview_customer WHERE ?";
                
                var whereValue = {
                    "interview_id" : interview_id
                };

                var query = conn.query(deleteSql1, whereValue, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }

                    var deleteSql2 = "DELETE FROM interviews WHERE ?";
                
                    var whereValue = {
                        "id" : interview_id
                    };

                    var query2 = conn.query(deleteSql2, whereValue, function(err, result) {
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
