var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var routes = require('./routes/index');
var users = require('./routes/users');
var ideas = require('./routes/ideas');
var interviews = require('./routes/interviews');
var snippets = require('./routes/snippets');
var customers = require('./routes/customers');
var authenticate = require('./routes/authenticate');
var dashboard = require('./routes/dashboard');
var mysql = require('mysql');
var connection = require('express-myconnection');
var config = require('./config/config');
var jwt    = require('jsonwebtoken'); 

var app = express();
app.config = config;

app.use(connection(mysql, {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    database: config.database.database
}, 'request'));

app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('jwtkey', config.secret.key); // secret variable

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api/v1/users', users);
app.use('/api/v1/ideas', ideas);
app.use('/api/v1/interviews', interviews);
app.use('/api/v1/snippets', snippets);
app.use('/api/v1/customers', customers);
app.use('/api/v1/authenticate', authenticate);
app.use('/api/v1/dashboard', dashboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
