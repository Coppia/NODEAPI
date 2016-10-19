module.exports = {
    mode: {
      debug: true
    },
    server: {
            host: 'localhost',
            port: 8080
    },
    database: {
        host: 'us-cdbr-iron-east-04.cleardb.net',
        port: 3306,
        database: 'heroku_5e29cda4bc25bfc',
        user: 'b250f82d179f63',
        password: '8cc620f9'

        // host: 'localhost',
        // port: 3306,
        // database: 'coppia',
        // user: 'root',
        // password: 'squid2009'
    },
    secret: {
        key: 'a720496337f7bf3e27a6b763e34a7662f1961709daf7e506c590c6ba502bd783'
    },
    key: {
        privateKey: 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc',
        issuer: 'coppia.co',
        tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
    },
    email: {
        username: "",
        password: "",
        accountName: "",
        verifyEmailUrl: ""
    }
};
