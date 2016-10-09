var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.send('IDEAS: respond with a resource');
// });

// GET IDEAS
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
        var ideaId = req.param('idea_id');

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, title, goal, status, create_user, create_datetime, update_user, update_datetime FROM ideas WHERE id = ?', ideaId, function(err, rows, fields) {
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

// CREATE IDEA
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
                var insertSql = "INSERT INTO ideas SET ?";
                var insertValues = {
                    "title" : reqObj.title,
                    "goal" : reqObj.goal,
                    "status" : reqObj.status,
                    "create_user" : reqObj.create_user,
                    "update_user" : reqObj.create_user
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var IdeaId = result.insertId;
                    res.json({"IdeaId":IdeaId});
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
router.post('/idea_snippet/', function(req, res, next) {
    try {
        var reqObj = req.body;
        console.log(reqObj);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO idea_snippet SET ?";
                var insertValues = {
                    "idea_id" : reqObj.idea_id,
                    "snippet_id" : reqObj.snippet_id
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var InterviewSnippetId = result.insertId;
                    res.json({"InterviewSnippetId":InterviewSnippetId});
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
