const Promise = require('bluebird')
const restify = require('restify')
const db = require('./db')

const Entry = require('./schema').Entry
const Person = require('./schema').Person
const Device = require('./schema').Device

// server
const { name, version } = require('../package.json')
const server = restify.createServer({ name, version })

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

// state
let $lastEntriesTimestamp = new Date().getTime()

// db
db.connect().then(() => {
  return Entry.find({}, { limit: 1, sort: '-timestamp' }).then((entries) => {
    if (entries[0]) $lastEntriesTimestamp = entries[0].timestamp
  })
}).catch(err => {
  console.error('Error connecting to DB', err)
  process.exit()
})

// routes
server.post('/entries', (req, res, next) => {
  const { entries } = req.body
  // assuming all entries have the same timestamp
  $lastEntriesTimestamp = getTimestampFromEntries(entries)
  createEntries(entries)
    .then(() => res.send({ entries }))
    .catch(err => res.send(500, err.message)).then(next)
})

server.get('/entries', (req, res, next) => {
  getLatestEntries()
    .then(entries => res.send({ entries }))
    .catch(err => res.send(500, err.message)).then(next)
})

server.post('/associate', (req, res, next) => {
  const { person: personData, device: deviceData } = req.body
  findOrCreatePerson(personData).then(findOrCreateDeviceForPerson(deviceData))
    .catch(err => res.send(500, err.message)).then(next)
})

server.get('/summary', (req, res, next) => {
  Promise.map([getLatestEntries, getAllDevices])
    .then(([entries, devices]) => res.send({ entries, devices }))
    .catch(err => res.send(500, err.message)).then(next)
})

// functions
function findOrCreatePerson(person) {
  return Person.findOneAndUpdate({ identifier: person.identifier }, person)
}

function findOrCreateDeviceForPerson(device) {
  return (person) => {
    return Device.findOneAndUpdate({ mac: device.mac }, Object.assign({ person }, device))
  }
}

function getLatestEntries() {
  return Entry.find({ timestamp: $lastEntriesTimestamp })
}

function getAllDevices() {
  return Device.find({}, { populate: true })
}

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
