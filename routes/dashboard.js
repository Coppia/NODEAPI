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

// GET ALL IDEAS AND ASSOCIATIONS
router.get('/', function(req, res, next) {
    try {
        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return res.json({ success: false, message: 'Failed to connect to MySQL.' });   
                //return next(err);
            }
            else {
                conn.query(`SELECT	    ideas.id AS idea_id,
                                        ideas.title AS idea_title,
                                        ideas.goal AS idea_goal,
                                        ideas.status AS idea_status,
                                        ideas.create_user AS idea_create_user,
                                        ideas.create_datetime AS idea_create_datetime,
                                        snippets.text AS snippet_text,
                                        snippets.create_datetime AS snippet_create_datetime,
                                        customers.first_name AS customer_first_name,
                                        customers.last_name AS customer_last_name
                            FROM		ideas
                            LEFT JOIN	idea_snippet
                                ON		ideas.id = idea_snippet.idea_id
                            LEFT JOIN	snippets
                                ON		idea_snippet.snippet_id = snippets.id
                            LEFT JOIN	interviews
                                ON		snippets.interview_id = interviews.id
                            LEFT JOIN	interview_customer
                                ON		interviews.id = interview_customer.interview_id
                            LEFT JOIN	customers
                                ON		interview_customer.customer_id = customers.id`, function(err, rows, fields) {
                    conn.release();
                    
                    if (err) {
                        console.error('SQL Error: ', err);
                        return res.json({ success: false, message: 'SQL Error occurred: ' + err }); 
                    }
                    res.json(rows);
                });
            }
        });
    }
    catch(ex) {
        console.error("Internal error: ", ex);
        return res.json({ success: false, message: 'Internal Error occurred: ' + ex }); 
    }
});

module.exports = router;