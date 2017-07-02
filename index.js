const arpscanner = require('arpscan')
const interfaceValue = null
arpscanner(onResult, { sudo: true, interface: interfaceValue })

function onResult(err, data) {
	if (err) throw err
	console.log(data)
}
