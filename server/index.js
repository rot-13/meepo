const restify = require('restify')
const scanner = require('./scanner')
const db = require('./db')
const Entry = require('./schema').Entry

// db
db.connect().catch(err => {
  console.error('Error connecting to DB', err)
  process.exit()
})

// server
const { name, version } = require('../package.json')
const server = restify.createServer({ name, version })

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

// state
let $lastEntriesTimestamp = new Date().getTime()

// routes
server.post('/entries', (req, res, next) => {
  // assuming all entries have the same timestamp
  $lastEntriesTimestamp = getTimestampFromEntries(req.body.entries)
  createEntries(req.body.entries)
    .then(() => res.send(200))
    .catch(err => res.send(500, err.message)).then(next)
})

server.get('/entries', (req, res, next) => {
  Entry.find({ timestamp: $lastEntriesTimestamp })
    .then(entries => res.send(entries))
    .catch(err => res.send(500, err.message)).then(next)
})

server.get('/entries/count', (req, res, next) => {
  Entry.count({ timestamp: $lastEntriesTimestamp })
    .then(count => res.send(200, count))
    .catch(err => res.send(500, err.message)).then(next)
})

server.get('/scan', (req, res, next) => {
  scanner
    .scan()
    .then(entries => {
      $lastEntriesTimestamp = getTimestampFromEntries(entries)
      createEntries(entries)
      res.send(entries)
    })
    .catch(err => res.send(500, err.message)).then(next)
})

// functions
function getTimestampFromEntries(entries) {
  return entries && entries[0] && entries[0].timestamp
}

function createEntry(entry) {
  return Entry.create(entry).save()
}

function createEntries(entries) {
  return Promise.all(entries.map(entry => createEntry(entry)))
}

module.exports = server
