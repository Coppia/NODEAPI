var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'squid2009',
        database: 'coppia'
});

connection.connect(function(err) {
    if(!!err) {
        console.log('Connection Error to MySQL database');
    } else {
        console.log('Connection to MySQL successful');
    }
});

app.get('/', function(req, res) {
    connection.query("select ideas.title, snippets.text from ideas join idea_snippets on ideas.id = idea_snippets.idea_id join snippets on idea_snippets.snippet_id = snippets.id", function(err, rows, fields) {
        if (!!err) {
            console.log('Error occurred in the SQL Query');
            connection.release();
        } else {
            console.log('Successful SQL Query');
            console.log('Title of Idea: ' + rows[0].title);
            console.log('Interview 1: ' + rows[0].text);
            console.log('Interview 2: ' + rows[1].text);
            res.json(rows);
            res.end();
            connection.release();
        }
    });
});

app.listen(1337);
