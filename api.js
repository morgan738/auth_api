const express = require('express');
const app = express.Router();
const {
    authenticate,
    findUserByToken,
    getAllUsers
} = require('./db');

const isLoggedIn = async(req,res,next) => {
    try {
      const user = await findUserByToken(req.headers.authorization)
      req.user = user
      console.log("loggedin ", req.user)
      next()
    } catch (error) {
      next(error)
    }
}

app.get('/users', async(req,res,next) => {
    try {
        res.send(await getAllUsers());
    } catch (error) {
        next(error)
    }
})

app.post('/login', async(req,res,next) => {
    try {
      const response = await authenticate(req.body)
      res.send({token: response})
    } catch (error) {
      next(error)
    }
})

app.get('/me', isLoggedIn, async (req,res,next) => {
    try {
      res.send(req.user)
    } catch (error) {
      next(error)
    }
})


module.exports = app;