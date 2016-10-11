module.exports = {
    mode: {
      debug: true
    },
    server: {
            host: 'localhost',
            port: 7002
    },
    database: {
        host: 'coppia-mysql.c2nenncbrekn.us-west-2.rds.amazonaws.com',
        port: 3306,
        database: 'coppia',
        user: 'coppia_admin',
        password: 'squid2009'
    },
    key: {
        privateKey: 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc',
        issuer: 'METALHEAD',
        tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
    },
    email: {
        username: "",
        password: "",
        accountName: "",
        verifyEmailUrl: ""
    }
};
