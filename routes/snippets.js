var express = require('express');
var router = express.Router();

// GET ALL SNIPPET - will probably be never used in codeS
router.get('/', function(req, res, next) {
    try {
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, text, interview_id, create_user, create_datetime, update_user, update_datetime FROM snippets', function(err, rows, fields) {
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


// GET SNIPPETS BY :id
router.get('/:snippet_id', function(req, res, next) {
    try {
        var request = req.params;
        var snippet_id = request.snippet_id;

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, text, interview_id, create_user, create_datetime, update_user, update_datetime FROM snippets WHERE id = ?', snippet_id, function(err, rows, fields) {
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

// CREATE SNIPPET BY INTERVIEW ID
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
                var insertSql = "INSERT INTO snippets SET ?";
                var insertValues = {
                    "text" : reqObj.text,
                    "interview_id" : request.interview_id,
                    "create_user" : request.create_user,
                    "update_user" : request.create_user
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var snippet_id = result.insertId;
                    res.json({"snippet_id":snippet_id});
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
