const dbConnect = require('camo').connect

const dbUri = 'mongodb://localhost:27017/meepo'
exports.connect = function connect() {
  dbConnect(dbUri)
}
