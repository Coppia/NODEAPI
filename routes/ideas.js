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

// GET ALL IDEAS
router.get('/', function(req, res, next) {
    try {
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err); 
            }
            else {
                conn.query('SELECT id, title, goal, status, create_user, create_datetime, update_user, update_datetime FROM ideas', function(err, rows, fields) {
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

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, title, goal, status, create_user, create_datetime, update_user, update_datetime FROM ideas WHERE id = ?', idea_id, function(err, rows, fields) {
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

// POST IDEA
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

        req.getConnection(function(err, conn) {
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

        req.getConnection(function(err, conn) {
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
router.delete('/:idea_id', function(req, res, next) {
    try {
        var currdatetime = new Date();
        var idea_id = req.params.idea_id;
        var request = req.body;

        req.getConnection(function(err, conn) {
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
