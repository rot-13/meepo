const arpscanner = require('arpscan')

exports.scan = function() {
  return new Promise((resolve, reject) => {
    arpscanner(
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          reject(new Error('blabla'))
        }
      },
      { sudo: true, interface: null }
    )
  })
}
