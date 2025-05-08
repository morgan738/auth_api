const express = require('express');
//const pg = require('pg');
//const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/auth_api');
const path = require('path');
const app = express();
app.use(express.json());
app.use(require('cors')());

//app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../public/index.html')));

const{client, createUser, createFavorite} = require('./db')


app.use('/api', require('./api'));

const seedDb = async () => {
  const SQL = `
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(200) NOT NULL,
      );

      DROP TABLE IF EXISTS favorites CASCADE;
      CREATE TABLE favorites(
        id UUID PRIMARY KEY,
        games_id INTEGER REFERENCES games(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT games_and_user_key UNIQUE(games_id, user_id)
      );

      DROP TABLE IF EXISTS games CASCADE;
      CREATE TABLE games(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR (1000),
        price INTEGER,
        image VARCHAR(1000),
        rating INTEGER DEFAULT 1
      );
      

      INSERT INTO games (name,description, price, image, rating ) VALUES('God of War', 'Angry dad connects with son', 6000, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/God_of_War_4_cover.jpg/250px-God_of_War_4_cover.jpg', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Persona 5 Royal', 'Stealing desires', 12000, 'https://static.wikia.nocookie.net/megamitensei/images/6/6c/P5R_Key_Art.jpg/revision/latest?cb=20210329153657', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Helldivers 2', 'Spread democracy', 4000, 'https://helldivers.wiki.gg/images/5/5e/HD2_SteamLibrary-Portrait.jpg?ffffe7', 5);
    `;
    /* INSERT INTO users (username, password) VALUES('morgan', '1234');
      INSERT INTO users (username, password) VALUES('dylan', 'dDawg');
      INSERT INTO users (username,password ) VALUES('cathy', 'cat456'); */

    await client.query(SQL);

    const [morgan, parker, dylan, devin] = await Promise.all([
        createUser({username: 'morgan', password: '1234'}),
        createUser({username: 'parker', password: 'parkerPass'}),
        createUser({username: 'dylan', password: 'dDawg'}),
        createUser({username: 'devin', password: 'devster'}),
    ])
    await Promise.all([
      createFavorite({ user_id: morgan.id, games_id: 1 }),
      createFavorite({ user_id: morgan.id, games_id: 2 }),
      createFavorite({ user_id: dylan.id, games_id: 1 })
    ]);
}


const PORT = process.env.PORT || 3000;

const init = async()=> {
  try {
    await client.connect();
    app.listen(PORT, ()=> {
      console.log(`listening on port ${PORT}`);
    });
    // const SQL = `
    //   DROP TABLE IF EXISTS users CASCADE;
    //   CREATE TABLE users(
    //     id UUID PRIMARY KEY,
    //     username VARCHAR(100) NOT NULL,
    //     password VARCHAR(200) NOT NULL,
    //   );

    //   DROP TABLE IF EXISTS favorites CASCADE;
    //   CREATE TABLE favorites(
    //     id UUID PRIMARY KEY,
    //     games_id INTEGER REFERENCES games(id) NOT NULL,
    //     user_id UUID REFERENCES users(id) NOT NULL,
    //     CONSTRAINT games_and_user_key UNIQUE(games_id, user_id)
    //   );

    //   DROP TABLE IF EXISTS games CASCADE;
    //   CREATE TABLE games(
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(100) NOT NULL,
    //     description VARCHAR (1000),
    //     price INTEGER,
    //     image VARCHAR(1000),
    //     rating INTEGER DEFAULT 1
    //   );
      

    //   INSERT INTO games (name,description, price, image, rating ) VALUES('God of War', 'Angry dad connects with son', 6000, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/God_of_War_4_cover.jpg/250px-God_of_War_4_cover.jpg', 5);
    //   INSERT INTO games (name,description, price, image, rating ) VALUES('Persona 5 Royal', 'Stealing desires', 12000, 'https://static.wikia.nocookie.net/megamitensei/images/6/6c/P5R_Key_Art.jpg/revision/latest?cb=20210329153657', 5);
    //   INSERT INTO games (name,description, price, image, rating ) VALUES('Helldivers 2', 'Spread democracy', 4000, 'https://helldivers.wiki.gg/images/5/5e/HD2_SteamLibrary-Portrait.jpg?ffffe7', 5);
    // `;
    // /* INSERT INTO users (username, password) VALUES('morgan', '1234');
    //   INSERT INTO users (username, password) VALUES('dylan', 'dDawg');
    //   INSERT INTO users (username,password ) VALUES('cathy', 'cat456'); */

    // await client.query(SQL);

    // const [morgan, parker, dylan, devin] = await Promise.all([
    //     createUser({username: 'morgan', password: '1234'}),
    //     createUser({username: 'parker', password: 'parkerPass'}),
    //     createUser({username: 'dylan', password: 'dDawg'}),
    //     createUser({username: 'devin', password: 'devster'}),
    // ])
    // await Promise.all([
    //   createFavorite({ user_id: morgan.id, games_id: 1 }),
    //   createFavorite({ user_id: morgan.id, games_id: 2 }),
    //   createFavorite({ user_id: dylan.id, games_id: 1 })
    // ]);
    if(process.env.SYNC){
      await seedDb()
    }
  }
  catch(ex){
    console.log(ex);
  }
}

init();