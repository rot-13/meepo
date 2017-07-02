const restify = require('restify')
const scanner = require('./scanner')
const db = require('./db')

// db
db.connect()

// server
const { name, version } = require('../package.json')
const server = restify.createServer({ name, version })

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.post('/api/entries', (req, res, next) => {
  // var lassie = Dog.create({
  //   name: 'Lassie',
  //   breed: 'Collie'
  // })
  //
  // lassie.save().then(function(l) {
  //   console.log(l._id)
  // })
  // req.body
})

server.get('/api/scan', (req, res, next) => {
  scanner
    .scan()
    .then(data => res.send(data))
    .catch(err => res.send(500, err.message)).then(next)
})

module.exports = server
