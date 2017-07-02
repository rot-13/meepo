const restify = require('restify')
const scanner = require('./scanner')

const { name, version } = require('../package.json')
const server = restify.createServer({ name, version })

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.get('/api/scan', (req, res, next) => {
  scanner
    .scan()
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.send(500, err.message)
    })
    .then(next)
})

module.exports = server
