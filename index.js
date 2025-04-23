const express = require('express');
//const pg = require('pg');
//const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/auth_api');
const path = require('path');
const app = express();
app.use(express.json());
app.use(require('cors')());

//app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../public/index.html')));

const{client, createUser} = require('./db')


app.use('/api', require('./api'));


const PORT = process.env.PORT || 3000;

const init = async()=> {
  try {
    await client.connect();
    app.listen(PORT, ()=> {
      console.log(`listening on port ${PORT}`);
    });
    const SQL = `
      DROP TABLE IF EXISTS users;
      CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL
      );
      INSERT INTO users (username, password) VALUES('morgan', 'password');
      INSERT INTO users (username, password) VALUES('dylan', 'dDawg');
      INSERT INTO users (username, password) VALUES('cathy', 'cat456');
    `;

    await client.query(SQL);

    const [morgan, parker, dylan, devin] = await Promise.all([
        createUser({username: 'morgan', password: '1234'}),
        createUser({username: 'parker', password: 'parkerPass'}),
        createUser({username: 'dylan', password: 'dDawg'}),
        createUser({username: 'devin', password: 'devster'}),
    ])
  }
  catch(ex){
    console.log(ex);
  }
}

init();