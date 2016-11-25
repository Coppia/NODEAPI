var express = require('express');
var jwt    = require('jsonwebtoken'); 
var pool = require('../config/conn');
var validator = require('validator');

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
                conn.query(`SELECT 	interviews.id, 
                                    interviews.title, 
                                    interviews.notes, 
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    interviews.create_datetime as created_datetime,
                                    create_users.image_link as created_image_link, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    interviews.update_datetime as updated_datetime,
                                    update_users.image_link as updated_image_link
                            FROM 	interviews
                            JOIN	users as create_users
                                ON	interviews.create_user = create_users.id
                            JOIN	users as update_users
                                ON	interviews.update_user = update_users.id;`, function(err, rows, fields) {
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
                    res.json(rows);
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

// GET INTERVIEW BY interview_id
router.get('/:interview_id', function(req, res, next) {
    try {
        var request = req.params;
        var interview_id = request.interview_id;

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
                conn.query(`SELECT 	interviews.id, 
                                    interviews.title, 
                                    interviews.notes, 
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    interviews.create_datetime as created_datetime,
                                    create_users.image_link as created_image_link, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    interviews.update_datetime as updated_datetime,
                                    update_users.image_link as updated_image_link
                            FROM 	interviews
                            JOIN	users as create_users
                                ON	interviews.create_user = create_users.id
                            JOIN	users as update_users
                                ON	interviews.update_user = update_users.id
                            WHERE   interviews.id = ?`, [interview_id], function(err, rows, fields) {
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

                    if (rows.length <= 0) {
                        res.json(
                            {
                                "success" : false,
                                "message" : "Interview could not be found with id: " + interview_id
                            }
                        );
                    } else {
                        var id = rows[0].id;
                        var title = rows[0].title;
                        var notes = rows[0].notes;
                        var created_by = rows[0].created_by;
                        var created_datetime = rows[0].created_datetime;
                        var created_image_link = rows[0].created_image_link;
                        var updated_by = rows[0].updated_by;
                        var updated_datetime = rows[0].updated_datetime;
                        var updated_image_link = rows[0].updated_image_link;

                        res.json(
                            {
                                "id" : id,
                                "title" : title,
                                "notes" : notes,
                                "created_by" : created_by,
                                "created_datetime" : created_datetime,
                                "created_image_link" : created_image_link,
                                "updated_by" : updated_by,
                                "updated_datetime" : updated_datetime,
                                "updated_image_link" : updated_image_link
                            }
                        );
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

// GET INTERVIEW CUSTOMER BY interview_id
router.get('/interview_customer/:interview_id', function(req, res, next) {
    try {
        var request = req.params;
        var interview_id = request.interview_id;

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
                conn.query(`SELECT	customers.id,
                                    customers.first_name,
                                    customers.last_name,
                                    customers.email,
                                    customers.image_link,
                                    customers.title, 
                                    customers.company_name, 
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    customers.create_datetime as created_datetime,
                                    create_users.image_link as created_image_link, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    customers.update_datetime as updated_datetime,
                                    update_users.image_link as updated_image_link
                            FROM 	customers
                            JOIN	interview_customer
                                ON	customers.id = interview_customer.customer_id
                            JOIN	users as create_users
                                ON	customers.create_user = create_users.id
                            JOIN	users as update_users
                                ON	customers.update_user = update_users.id
                            WHERE  	interview_customer.interview_id = ?`, [interview_id], function(err, rows, fields) {

                                console.log('row length: ' + rows.length);
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

                    if (rows.length <= 0) {
                        res.json(
                            {
                                "success" : false,
                                "message" : "Interview Customer could not be found with id: " + interview_id
                            }
                        );
                    } else {
                        var id = rows[0].id;
                        var first_name = rows[0].first_name;
                        var last_name = rows[0].last_name;
                        var email = rows[0].email;
                        var image_link = rows[0].image_link;
                        var title = rows[0].title; 
                        var company_name = rows[0].company_name; 
                        var created_by = rows[0].created_by;
                        var created_datetime = rows[0].created_by;
                        var created_image_link = rows[0].created_image_link;
                        var updated_by = rows[0].updated_by;
                        var updated_datetime = rows[0].updated_datetime;
                        var updated_image_link = rows[0].updated_image_link;
                        
                        res.json(
                            {
                                "id" : id,
                                "first_name" : first_name,
                                "last_name" : last_name,
                                "email" : email,
                                "image_link" : image_link,
                                "title" : title,
                                "company_name" : company_name,
                                "created_by" : created_by,
                                "created_datetime" : created_datetime,
                                "created_image_link" : created_image_link,
                                "updated_by" : updated_by,
                                "updated_datetime" : updated_datetime,
                                "updated_image_link" : updated_image_link
                            }
                        );
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

// POST INTERVIEW
router.post('/', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var request = req.body;
      
        pool.getConnection(function(err, conn) {
            if (err) {
                res.json(
                    {
                        "success" : false,
                        "message" : "SQL Connection Error: " + err
                    }
                );
                // console.error('SQL Connection Error: ', err);
                // return next(err);
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
                  
                    var interview_id = result.insertId;
                    res.json(
                        {
                            "interview_id" : interview_id
                        }
                    );
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
        // console.error('Internal Error: ' + ex);
        // return next(ex);
    }
});

// POST INTERVIEW CUSTOMER
router.post('/interview_customer/', function(req, res, next) {
    try {
        var request = req.body;
        var interview_id = request.interview_id;
        var customer_id = request.customer_id;
      
        pool.getConnection(function(err, conn) {
            if (err) {
                res.json(
                    {
                        "success" : false,
                        "message" : "SQL Connection Error: " + err
                    }
                );
                // console.error('SQL Connection Error: ', err);
                // return next(err);
            }
            else {

                if (validator.isEmpty(interview_id)) {
                    return res.json(
                        {
                            "success" : false,
                            "message" : "Imterview ID cannot be empty or null"
                        }
                    );
                }

                if (validator.isEmpty(customer_id)) {
                    return res.json(
                        {
                            "success" : false,
                            "message" : "Customer ID cannot be empty or null"
                        }
                    );
                }

                var insertSql = "INSERT INTO interview_customer SET ?";
                var insertValues = {
                    "interview_id" : interview_id,
                    "customer_id" : customer_id
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
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
               
                    var interview_customer_id = result.insertId;
                    res.json(
                        {
                            "interview_customer_id" : interview_customer_id
                        }
                    );
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
        // console.error('Internal Error: ' + ex);
        // return next(ex);
    }
});

// UPDATE INTERVIEW BY interview_id
router.put('/:interview_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var interview_id = req.params.interview_id;
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                res.json(
                    {
                        "success" : false,
                        "message" : "SQL Connection Error: " + err
                    }
                );
                // console.error('SQL Connection Error: ', err);
                // return next(err);
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

                    var affectedRows = result.affectedRows;
                    var changedRows = result.changedRows;
                    var message = result.message;

                    if (affectedRows === 1 && changedRows === 1) {
                        res.json({ "success" : true, "message" : message });
                    } else {
                        res.json({ "success" : false, "message" : message });
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
        // console.error('Internal Error: ' + ex);
        // return next(ex);
    }
});

//DELETE IDEA BY idea_id
router.delete('/:interview_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var interview_id = req.params.interview_id;
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                res.json(
                    {
                        "success" : false,
                        "message" : "SQL Connection Error: " + err
                    }
                );
                // console.error('SQL Connection Error: ', err);
                // return next(err);
            }
            else {
                var deleteSql1 = "DELETE FROM interview_customer WHERE ?";
                
                var whereValue = {
                    "interview_id" : interview_id
                };

                var query = conn.query(deleteSql1, whereValue, function(err, result) {
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

                    var deleteSql2 = "DELETE FROM interviews WHERE ?";
                
                    var whereValue = {
                        "id" : interview_id
                    };

                    var query2 = conn.query(deleteSql2, whereValue, function(err, result) {
                        conn.release();
                        
                        if (err) {
                            res.json(
                                {
                                    "success" : false,
                                    "message" : "SQL Error: " + err
                                }
                            );
                            // console.error('SQL Error: ' + err);
                            // return next(err);
                        }

                        var affectedRows = result.affectedRows;
                        var changedRows = result.changedRows;
                        var message = result.message;

                        if (affectedRows === 1 && changedRows === 1) {
                            res.json({ "success" : true, "message" : message });
                        } else {
                            res.json({ "success" : false, "message" : message });
                        }
                    });
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
        // console.error('Internal Error: ' + ex);
        // return next(ex);
    }
});

module.exports = router;
