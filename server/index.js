const _ = require('lodash')
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
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { entries } = req.body
  let timestamp = new Date().getTime()
  $lastEntriesTimestamp = timestamp = new Date().getTime()
  createEntriesWithTimestamp(entries, timestamp)
    .then(() => res.send({ entries }))
    .catch(handleError(res)).then(next)
})

server.get('/entries', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  getLatestEntries()
    .then(entries => res.send({ entries }))
    .catch(handleError(res)).then(next)
})

server.post('/associate', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { person: personData, device: deviceData } = req.body
  findOrCreatePerson(personData).then(findOrCreateDeviceForPerson(deviceData))
    .then(() => res.send(200))
    .catch(handleError(res)).then(next)
})

server.get('/people', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  Promise.all([getLatestEntries(), getAllDevices()])
    .then(([entries, devices]) => {
      const people = entries.reduce((people, entry) => {
        const matchingDevice = devices.find(device => !device.blacklisted && device.mac === entry.mac)
        if (matchingDevice) people.push(matchingDevice.person)
        return people
      }, [])
      res.send({ people: _.uniqBy(people, 'identifier') })
    })
    .catch(handleError(res)).then(next)
})

server.get('/summary', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  Promise.all([getLatestEntries(), getAllDevices()])
    .then(([entries, devices]) => res.send({ entries, devices }))
    .catch(handleError(res)).then(next)
})

// functions
function findOrCreatePerson(person) {
  return Person.findOne({ identifier: person.identifier })
    .then(foundPerson => {
      if (foundPerson) {
        return Object.assign(foundPerson, person).save()
      } else {
        return Person.create(person).save()
      }
    })
}

function findOrCreateDeviceForPerson(device) {
  return person => {
    return Device.findOne({ mac: device.mac })
      .then(foundDevice => {
        const deviceData = Object.assign({ person }, device)
        if (foundDevice) {
          return Object.assign(foundDevice, deviceData).save()
        } else {
          return Device.create(deviceData).save()
        }
      })
  }
}

function getLatestEntries() {
  return Entry.find({ timestamp: $lastEntriesTimestamp })
}

function getAllDevices() {
  return Device.find({}, { populate: true })
}

function createEntryWithTimestamp(entry, timestamp) {
  return Entry.create(Object.assign({}, entry, { timestamp })).save()
}

function createEntriesWithTimestamp(entries, timestamp) {
  return Promise.all(entries.map(entry => createEntryWithTimestamp(entry, timestamp)))
}

function handleError(res) {
  return (err) => {
    console.error(err.stack)
    res.send(500, err.message)
  }
}

module.exports = server
