const express = require("express");
//const pg = require('pg');
//const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/auth_api');
const path = require("path");
const app = express();
app.use(express.json());
app.use(require("cors")());

//app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../public/index.html')));

const { client, createUser, createFavorite } = require("./db");

app.use("/api", require("./api"));

const seedDb = async () => {
  const SQL = `
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(200) NOT NULL
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
        
        DROP TABLE IF EXISTS favorites CASCADE;
        CREATE TABLE favorites(
          fav_id UUID PRIMARY KEY,
          games_id INTEGER REFERENCES games(id) NOT NULL,
          user_id UUID REFERENCES users(id) NOT NULL,
          CONSTRAINT games_and_user_key UNIQUE(games_id, user_id)
        );

      INSERT INTO games (name,description, price, image, rating ) VALUES('God of War', 'Angry dad connects with son', 60, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/God_of_War_4_cover.jpg/250px-God_of_War_4_cover.jpg', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Persona 5 Royal', 'Stealing desires', 120, 'https://i.scdn.co/image/ab67616d0000b27359a6022f671f929b9979011d', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Helldivers 2', 'Spread democracy', 40, 'https://helldivers.wiki.gg/images/thumb/Helldivers_2_Key_Art_2x3.png/800px-Helldivers_2_Key_Art_2x3.png?21106d', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Trails in the Sky 1st Chapter', 'Becoming the best bracer', 60, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3375780/a256c3cc1601eb983578ab77ae36c121091a3f4f/capsule_616x353.jpg?t=1777572632', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Hitman World Of Assassination', 'Well done, 47', 30, 'https://store-images.s-microsoft.com/image/apps.46241.13747708785346246.26b7a239-7aa3-4075-aceb-3fe6324cd11b.22bae141-a400-44a8-b4fa-9836c6e260e5', 5);
      INSERT INTO games (name,description, price, image, rating ) VALUES('Resident Evil Requiem', 'Leon OP', 70, 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/Resident_Evil_Requiem_Cover_Art.jpg/250px-Resident_Evil_Requiem_Cover_Art.jpg', 5);
    `;

  await client.query(SQL);

  /* const [morgan, ethel, david, katie] = await Promise.all([
    createUser({ username: "morgan", password: "1234" }),
    createUser({ username: "ethel", password: "ethelPass" }),
    createUser({ username: "david", password: "dDawg" }),
    createUser({ username: "katie", password: "katester" }),
  ]);
  await Promise.all([
    createFavorite({ user_id: morgan.id, games_id: 1 }),
    createFavorite({ user_id: morgan.id, games_id: 2 }),
    createFavorite({ user_id: ethel.id, games_id: 1 }),
  ]); */
  console.log("finished seeding db");
};

const seedUsers = async () => {
  const [morgan, ethel, david, katie] = await Promise.all([
    createUser({ username: "morgan", password: "1234" }),
    createUser({ username: "ethel", password: "ethelPass" }),
    createUser({ username: "david", password: "dDawg" }),
    createUser({ username: "katie", password: "katester" }),
  ]);
};

const seedUserFavs = async () => {
  await Promise.all([
    createFavorite({ user_id: morgan.id, games_id: 1 }),
    createFavorite({ user_id: morgan.id, games_id: 2 }),
    createFavorite({ user_id: ethel.id, games_id: 1 }),
  ]);
};
const PORT = process.env.PORT || 3000;

const init = async () => {
  try {
    await client.connect();
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });

    if (process.env.SYNC === "true") {
      await seedDb();
      await seedUsers();
      await seedUserFavs();
    }
  } catch (ex) {
    console.log(ex);
  }
};

init();
