const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Saivamshi)2284',
  database: 'rtr'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + connection.threadId);

    try {
        insertRandomUser();
    } catch (error) {
        console.error('Error executing query:', error.stack);
    } finally {
        connection.end();
    }
});

function getRandomUser() {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number()
    };
}

function insertRandomUser() {
    const user = getRandomUser();
    const query = 'INSERT INTO users (first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?)';
    connection.query(query, [user.firstName, user.lastName, user.email, user.phoneNumber], (err, results) => {
        if (err) throw err;
        console.log('User inserted:', results.insertId);

        // Insert a record into checkin_checkout table
        const checkinCheckoutQuery = 'INSERT INTO checkin_checkout (s_id, b_id, check_out_time) VALUES (?, ?, ?)';
        connection.query(checkinCheckoutQuery, [results.insertId, faker.datatype.number({ min: 1, max: 10 }), new Date()], (err, results) => {
            if (err) throw err;
            console.log('Checkin/Checkout record inserted:', results.insertId);
        });
    });
}

// Example usage:
console.log(getRandomUser());