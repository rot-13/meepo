const dbConnect = require('camo').connect

const dbUri = process.env.PROD_MONGODB || 'mongodb://localhost:27017/meepodb'
exports.connect = function connect() {
  return dbConnect(dbUri)
}
