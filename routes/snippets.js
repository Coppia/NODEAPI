var express = require('express');
var router = express.Router();

// GET SNIPPETS BY :id
router.get('/:snippet_id', function(req, res, next) {
    try {
        var snippetId = req.param('snippet_id');

        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            }
            else {
                conn.query('SELECT id, text, interview_id, create_user, create_datetime, update_user, update_datetime FROM snippets WHERE id = ?', snippetId, function(err, rows, fields) {
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
        var reqObj = req.body;
        console.log(reqObj);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection Error: ', err);
                return next(err);
            }
            else {
                var insertSql = "INSERT INTO snippets SET ?";
                var insertValues = {
                    "text" : reqObj.text,
                    "interview_id" : reqObj.interview_id,
                    "create_user" : reqObj.create_user,
                    "update_user" : reqObj.create_user
                };

                var query = conn.query(insertSql, insertValues, function(err, result) {
                    if (err) {
                        console.error('SQL Error: ', err);
                        return next(err);
                    }
                    console.log(result);
                    var SnippetId = result.insertId;
                    res.json({"SnippetId":SnippetId});
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
