const escaper = require('./escaper.js')

module.exports = (command, parameters, options) => {
	let out = command

	if (typeof parameters !== 'undefined') {
		for (let key in parameters) {
			if (parameters.hasOwnProperty(key)) {
				if (typeof parameters[key] !== 'object') {
					out += ` ${key}=${escaper(parameters[key])}`
				} else if (typeof parameters[key] === 'object') {
					let array = parameters[key]
					out += ' '

					for (let obj of array) {
						let part = ''

						for (let thing in obj) {
							part += ` ${thing}=${escaper(obj[thing])}`
						}

						part = part.substr(1)
						out += part + '|'
					}

					out = out.substring(0, out.length - 1)
				}
			}
		}
	}

	if (typeof options === 'string')
		out += ` ${options}`

	if (typeof options === 'object')
		for (let option of options) {
			out += ` -${option}`
		}

	return out
}
