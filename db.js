import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error('error connecting to the database pool :(', error);
  } else {
    console.log('database connected .3');
    connection.release();
  }
});
