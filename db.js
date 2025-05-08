const pg = require('pg');
const bcrypt = require('bcrypt')
const { v4 } = require('uuid');
const uuidv4 = v4;
const jwt = require('jsonwebtoken')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/auth_api');

const getAllUsers = async() => {
    const SQL = `
        SELECT *
        FROM users
    `
    const response = await client.query(SQL);
    return response.rows;
}

const createUser = async(user) => {
    if(!user.username.trim() || !user.password.trim()){
      throw Error('must have username and password')
    }
    //user.password = await bcrypt.hash(user.password, 5)
    const SQL = `
      INSERT INTO users (id, username, password)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const response = await client.query(SQL, [uuidv4(), user.username, user.password ])
    return response.rows[0]
}

const findUserByToken = async(token) => {
    try {
      const payload = await jwt.verify(token, process.env.JWT)
      const SQL = `
        SELECT id, username
        FROM users
        WHERE id = $1
      `
      const response = await client.query(SQL, [payload.id])
      if(!response.rows.length){
        const error = Error('bad credentials')
        error.status = 401
        throw error
      }
  
      return response.rows[0]
    } catch (error) {
      console.log(error)
    }
  }

const authenticate = async(credentials) => {
    const SQL = `
      SELECT id, password
      FROM users
      WHERE username = $1
    `
    const response = await client.query(SQL, [credentials.username])
    if(!response.rows.length){
      const error = Error('bad credentials')
      error.status = 401
      throw error
    }
  
    //const valid = await bcrypt.compare(credentials.password, response.rows[0].password)
    const valid = credentials.password === response.rows[0].password
    console.log(credentials.password, response.rows)
    if(!valid){
      const error = Error('bad credentials')
      error.status = 401
      throw error
    }
  
    return jwt.sign({id: response.rows[0].id}, process.env.JWT)
  
  }

  const getAllGames = async () => {
    const SQL = `
        SELECT *
        FROM games
    `
    const response = await client.query(SQL);
    return response.rows;
  }

  const getSingleGame = async (id) => {
    const SQL = `
        SELECT *
        FROM games
        WHERE id = $1
    `
    const response = await client.query(SQL,[id]);
    return response.rows[0];
  }

  const addNewGame = async (newGame) => {
    const SQL = `
        INSERT INTO games(name, description, price, image, rating)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `
    const response = await client.query(SQL,[newGame.name, newGame.description, newGame.price, newGame.image, newGame.rating]);
    return response.rows[0];
  }

  const deleteGame = async (id) => {
    const SQL = `
        DELETE
        FROM games
        WHERE id = $1
    `
    const response = await client.query(SQL,[id]);
    return response; 
  }

  const updateGame = async (game, id) => {
    console.log(game)
    const SQL = `
        UPDATE games
        SET name = $1, description = $2, price = $3, image = $4, rating = $5
        WHERE id = $6
        RETURNING *
    `
    const response = await client.query(SQL,[game.name, game.description, game.price, game.image, game.rating, id]);
    console.log(response)
    return response.rows[0]; 
  }

  const createFavorite = async(favorite)=> {
    const SQL = `
    INSERT INTO favorites (games_id, user_id, id) VALUES($1, $2, $3) RETURNING *
  `;
   response = await client.query(SQL, [ favorite.games_id, favorite.user_id, uuidv4()]);
    return response.rows[0];
  };

  const deleteFavorite = async(favorite)=> {
    const SQL = `
      DELETE from favorites 
      WHERE id = $1 AND user_id = $2
    `;
    await client.query(SQL, [favorite.id, favorite.user_id]);
  };

  const fetchFavorites = async(userId)=> {
    const SQL = `
      SELECT * FROM favorites
      WHERE user_id = $1
    `;
    const response = await client.query(SQL, [ userId ]);
    console.log(response)
    return response.rows;
  };
  
  module.exports = {
    client,
    authenticate,
    findUserByToken,
    getAllUsers,
    createUser,
    getAllGames,
    getSingleGame,
    addNewGame,
    deleteGame,
    updateGame,
    createFavorite,
    deleteFavorite,
    fetchFavorites
  };