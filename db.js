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
  module.exports = {
    client,
    authenticate,
    findUserByToken,
    getAllUsers,
    createUser
  };