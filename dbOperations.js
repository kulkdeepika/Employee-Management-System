const mysql = require('mysql');
// This is the database class where we define a constructor which will take in the users configuration
// and connect to the database. The method, query() will query the database with the passed query string and
//the arguments if present. This method returns a promise.

// The close() method in this class will end the connection to the database.
//The object of this class in queries.js will give access to these methods which are used throughout the file.
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);

        this.connection.connect(function(err){
            if(err){
                throw err;
            }
            //console.log(`connected as id ${this.connection.threadID}`);
        })
    }
    query(sql, args) {
        return new Promise( (resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            } );
        } );
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            } );
        } );
    }
}

module.exports = Database;