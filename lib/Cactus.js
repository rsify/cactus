const builder = require('./builder.js')

class module.exports {
	constructor () {
		console.log('hi')
	}

	send (command, p1, p2, p3) {
		let parameters = {}, options = [], callback = () => {}

		if (typeof p2 === "object")
			parameters = p1
			options = p2
			callback = p3
		else (if typeof p1 === "object")
			parameters = p1
			callback = p2
		else
			callback = p1

		if (typeof parameters === "undefined") { parameters = {} }
		if (typeof options === "undefined") { options = [] }
		if (typeof callback === "undefined") { callback = () => {} }

		let data = builder(command, parameters, options)
		this.queue(data, callback)
	}
}
