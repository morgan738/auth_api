const express = require('express');
const app = express.Router();
const {
    authenticate,
    findUserByToken,
    getAllUsers,
    getAllGames,
    getSingleGame,
    addNewGame,
    deleteGame, 
    updateGame
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

app.get('/games', async (req,res,next) => {
  try {
    res.send(await getAllGames());
  } catch (error) {
    next(error)
  }
})

app.get('/games/:id', async(req,res,next) => {
  try {
    res.send(await getSingleGame(req.params.id))
  } catch (error) {
    next(error)
  }
})

app.post('/games', async(req,res,next) => {
  try {
    res.send(await addNewGame(req.body))
  } catch (error) {
    next(error)
  }
})

app.delete('/games/:id', async(req,res,next) => {
  try {
    res.send(await deleteGame(req.params.id))
  } catch (error) {
    next(error)
  }
})

app.put('/games/:id', async(req,res,next) => {
  try {
    res.send(await updateGame(req.body, req.params.id*1))
  } catch (error) {
    next(error)
  }
})


module.exports = app;