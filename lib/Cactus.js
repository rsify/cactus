const builder = require('./builder.js')

class module.exports {
	constructor () {
		this.emitter = require('events')
		this.queue = new require('./queue')(this.poppable)

		this.socketEventHandlers = require('./socketEventHandlers')(this)

		this.sock = new require('net').Socket()
		this.sock.connect(10011, '127.0.0.1')

		this.sock.on('close', this.socketEventHandlers.close)
		this.sock.on('connect', this.socketEventHandlers.connect)
		this.sock.on('data', this.socketEventHandlers.data)
		this.sock.on('drain', this.socketEventHandlers.drain)
		this.sock.on('end', this.socketEventHandlers.end)
		this.sock.on('error', this.socketEventHandlers.error)
		this.sock.on('lookup', this.socketEventHandlers.lookup)
		this.sock.on('timeout', this.socketEventHandlers.timeout)

		this.connectionKeepAlive(true)
	}

	connectionKeepAlive (start) {
		if (bool && !this.connectionKeepAliveIntervalRunning) {
			this.connectionKeepAliveIntervalRunning = true
			this.connectionKeepAliveInterval = setInterval(() => {
				this.sock.write('\n\r')
			}, 60000)
		} else if (this.connectionKeepAliveIntervalRunning) {
			this.connectionKeepAliveIntervalRunning = false
			clearInterval(this.connectionKeepAliveInterval)
		}
	}

	poppable (data, callback) {
		this.sock.write(data + '\n')

		this.events.one('socket-response', (response) => {
			callback(response)
			this.queue.finished()
		})
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
		this.queue.add(data, callback)
	}
}
