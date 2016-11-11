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

// GET ALL IDEAS
router.get('/', function(req, res, next) {
    try {
        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err); 
            }
            else {
                conn.query(`SELECT	    ideas.id,
                                        ideas.title,
                                        ideas.goal,
                                        ideas.status,
                                        CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                        ideas.create_datetime as created_datetime,
                                        create_users.image_link as created_image_link, 
                                        CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                        ideas.update_datetime as updated_datetime,
                                        update_users.image_link as updated_image_link 
                            FROM		ideas
                            JOIN		users as create_users
                                ON		ideas.create_user = create_users.id
                            JOIN		users as update_users
                                ON		ideas.update_user = update_users.id`, function(err, rows, fields) {
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

// GET IDEA BY idea_id
router.get('/:idea_id', function(req, res, next) {
    try {
        var request = req.params;
        var idea_id = request.idea_id;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query(`SELECT	    ideas.id,
                                        ideas.title,
                                        ideas.goal,
                                        ideas.status,
                                        CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                        ideas.create_datetime as created_datetime,
                                        create_users.image_link as created_image_link, 
                                        CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                        ideas.update_datetime as updated_datetime,
                                        update_users.image_link as updated_image_link 
                            FROM		ideas
                            JOIN		users as create_users
                                ON		ideas.create_user = create_users.id
                            JOIN		users as update_users
                                ON		ideas.update_user = update_users.id
                            WHERE       ideas.id = ?`, idea_id, function(err, rows, fields) {
                    conn.release();
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }

                    var id = rows[0].id,
                        title = rows[0].title,
                        goal = rows[0].goal,
                        status = rows[0].status,
                        created_by = rows[0].created_by,
                        created_datetime = rows[0].created_datetime,
                        created_image_link = rows[0].created_image_link, 
                        updated_by = rows[0].updated_by,
                        updated_datetime = rows[0].updated_datetime,
                        updated_image_link = rows[0].updated_image_link

                    res.json(
                        {
                            "id" : id,
                            "title" : title,
                            "goal" : goal,
                            "status" : status,
                            "created_by" : created_by,
                            "created_datetime" : created_datetime,
                            "created_image_link" : created_image_link,
                            "updated_by" : created_by,
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

// GET IDEA BY idea_id
router.get('/idea_snippet/:idea_id', function(req, res, next) {
    try {
        var request = req.params;
        var idea_id = request.idea_id;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query(`SELECT	snippets.id,
                                    snippets.text,
                                    snippets.interview_id,
                                    CONCAT(create_users.first_name, ' ', create_users.last_name) as created_by,
                                    snippets.create_datetime as created_datetime,
                                    create_users.image_link as created_image_link, 
                                    CONCAT(update_users.first_name, ' ', update_users.last_name) as updated_by,
                                    snippets.update_datetime as updated_datetime,
                                    update_users.image_link as updated_image_link 
                            FROM 	snippets
                            JOIN	idea_snippet
                                ON	snippets.id = idea_snippet.snippet_id
                            JOIN	users as create_users
                                ON	snippets.create_user = create_users.id
                            JOIN	users as update_users
                                ON	snippets.update_user = update_users.id
                            WHERE	idea_snippet.idea_id = ?;`, idea_id, function(err, rows, fields) {
                    conn.release();
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }

                    res.json(rows);

                    // var id = rows[0].id,
                    //     text = rows[0].text,
                    //     interview_id = rows[0].interview_id,
                    //     created_by = rows[0].created_by,
                    //     created_datetime = rows[0].created_datetime,
                    //     created_image_link = rows[0].created_image_link, 
                    //     updated_by = rows[0].updated_by,
                    //     updated_datetime = rows[0].updated_datetime,
                    //     updated_image_link = rows[0].updated_image_link

                    // res.json(
                    //     {
                    //         "id" : id,
                    //         "text" : text,
                    //         "interview_id" : interview_id,
                    //         "created_by" : created_by,
                    //         "created_datetime" : created_datetime,
                    //         "created_image_link" : created_image_link,
                    //         "updated_by" : updated_by,
                    //         "updated_datetime" : updated_datetime,
                    //         "updated_image_link" : updated_image_link
                    //     }
                    // );
                });
            }
        });
    }
    catch(ex) {
        console.error("Internal error: ", ex);
        return next(ex);
    }
});

// POST IDEA
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
                var insertSql = "INSERT INTO ideas SET ?";
                var insertValues = {
                    "title" : request.title,
                    "goal" : request.goal,
                    "status" : request.status,
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
                    var idea_id = result.insertId;
                    res.json({"idea_id":idea_id});
                });
            }
        });
    }
    catch(ex) {
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

// POST IDEA SNIPPET
router.post('/idea_snippet/', function(req, res, next) {
    try {
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO idea_snippet SET ?";
                var insertValues = {
                    "idea_id" : request.idea_id,
                    "snippet_id" : request.snippet_id
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    var idea_snippet_id = result.insertId;
                    res.json({"idea_snippet_id":idea_snippet_id});
                });
            }
        });
    }
    catch(ex) {
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

// PUT IDEA BY idea_id
router.put('/:idea_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var idea_id = req.params.idea_id;
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var updateSql = "UPDATE ideas SET ? WHERE ?";
                var updateValues = {
                    "title" : request.title,
                    "goal" : request.goal,
                    "status" : request.status,
                    "update_user" : request.update_user,
                    "update_datetime" : currdatetime
                };
                var whereValue = {
                    "id" : idea_id
                };

                var query = conn.query(updateSql, [updateValues, whereValue], function(err, result) {
                    conn.release();

                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
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
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

//DELETE IDEA BY idea_id
router.delete('/:idea_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var idea_id = req.params.idea_id;
        var request = req.body;

        pool.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var deleteSql1 = "DELETE FROM idea_snippet WHERE ?";
                
                var whereValue = {
                    "idea_id" : idea_id
                };

                var query = conn.query(deleteSql1, whereValue, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }

                    var deleteSql2 = "DELETE FROM ideas WHERE ?";
                
                    var whereValue = {
                        "id" : idea_id
                    };

                    var query2 = conn.query(deleteSql2, whereValue, function(err, result) {
                       conn.release();

                        if (err) {
                            console.error('SQL Error: ' + err);
                            return next(err);
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
        console.error('Internal Error: ' + ex);
        return next(ex);
    }
});

module.exports = router;
