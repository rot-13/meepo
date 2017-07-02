const arpscanner = require('arpscan/promise')

exports.scan = function() {
  return arpscanner({ sudo: true, interface: null })
}
