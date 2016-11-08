var express = require('express');
var jwt    = require('jsonwebtoken'); 
var config = require('../config/config');
var pool = require('../config/conn');

var clearbit = require('clearbit')('sk_8c4f1e46f0f1f4f3c4bdb7720ccc6260');

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
                                    customers.title, 
                                    customers.company_name, 
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    customers.create_datetime as created_datetime,
                                    create_users.image_link as created_image_link, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    customers.update_datetime as updated_datetime,
                                    update_users.image_link as updated_image_link
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
                                    customers.title, 
                                    customers.company_name, 
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    customers.create_datetime as created_datetime,
                                    create_users.image_link as created_image_link, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    customers.update_datetime as updated_datetime,
                                    update_users.image_link as updated_image_link
                            FROM    customers
                            JOIN	users as create_users
                                ON	customers.create_user = create_users.id
                            JOIN	users as update_users
                                ON	customers.update_user = update_users.id WHERE customers.id = ?`, customer_id, function(err, rows, fields) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }

                    var id = rows[0].id,
                        first_name = rows[0].first_name,
                        last_name = rows[0].last_name,
                        email = rows[0].email,
                        image_link = rows[0].image_link, 
                        title = rows[0].title, 
                        company_name = rows[0].company_name, 
                        created_by = rows[0].created_by,
                        created_datetime = rows[0].created_datetime,
                        created_image_link = rows[0].created_image_link, 
                        updated_by = rows[0].updated_by,
                        updated_datetime = rows[0].updated_datetime,
                        updated_image_link = rows[0].updated_image_link

                    res.json(
                        {
                            "id" : id,
                            "first_name" : firstname,
                            "lastname" : lastname,
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
router.get('/lookup/:email_address', function(req, res, next) {
    try {
        var request = req.params;
        var email_address = request.email_address;

        clearbit.Enrichment.find({email: email_address, stream: true})
            .then(function (person) {
                var fullname = person.person.name.fullName;
                var firstname = person.person.name.givenName;
                var lastname = person.person.name.familyName;
                var avatar = person.person.avatar;
                var email = person.person.email;
                var location = person.person.location;
                var domain = person.person.employment.domain;
                var company_name = person.person.employment.name;
                var title = person.person.employment.title;
                var role = person.person.employment.role;
                
                res.json(
                    {
                        "success" : "true",
                        "full_name" : fullname,
                        "last_name" : lastname,
                        "first_name" : firstname,
                        "email" : email,
                        "image_link" : avatar,
                        "location" : location,
                        "domain" : domain,
                        "company_name" : company_name,
                        "title" : title,
                        "role" : role
                    });
                //console.log(person);
            })
            .catch(clearbit.Enrichment.NotFoundError, function (err) {
                // Email address could not be found
                res.json(
                    {
                        "success" : "false",
                        "customer_id":customer_id
                    });
                console.log(err);
            })
            .catch(function (err) {
                console.error('Clearbit Connection Error: ', err);
                return next(err);
            }
        );
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
                    "title" : request.title, 
                    "company_name" : request.company_name, 
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
                    "title" : request.title, 
                    "company_name" : request.company_name, 
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
