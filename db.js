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
  
    const valid = await bcrypt.compare(credentials.password, response.rows[0].password)
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
    getAllUsers
  };