const dbConnect = require('camo').connect

const dbUri = 'mongodb://localhost:27017/meepodb'
exports.connect = function connect() {
  return dbConnect(dbUri)
}
