const Queue = require('./queue')
const Handlers = require('./socketEventHandlers')
const EventEmitter = require('events')
const builder = require('./builder')
const parser = require('./parser')

module.exports = class Cactus extends EventEmitter {
	constructor () {
		super()

		this.queue = new Queue(this.poppable)

		this.socketEventHandlers = new Handlers(this)

		this.sock = new require('net').Socket()
		this.sock.setEncoding('utf8')
		this.sock.connect(10011, '127.0.0.1')

		let events = ['close', 'connect', 'data', 'drain', 'end', 'error', 'lookup', 'timeout']
		for (let event of events) {
			this.sock.on(event, this.socketEventHandlers[event].bind(this))
		}

		this.commandsReady = false

		this.queue.add(this, '', (resp) => { // wait for ts' welcome message
			console.log('commands ready')
			this.emit('commands-ready')
			this.ready = true
		})
	}

	connectionKeepAlive (start) {
		if (start && !this.connectionKeepAliveIntervalRunning) {
			this.connectionKeepAliveIntervalRunning = true
			this.connectionKeepAliveInterval = setInterval(() => {
				this.sock.write('\n\r')
			}, 2000)
		} else if (!start && this.connectionKeepAliveIntervalRunning) {
			this.connectionKeepAliveIntervalRunning = false
			clearInterval(this.connectionKeepAliveInterval)
		}
	}

	poppable (data, callback) {
		if (this.ready) {
			this.sock.write(data + '\n')
		} else
			this.once('commands-ready', () => {
				this.sock.write(data + '\n')
			})
		// console.log('sending: ' + data)
		this.once('socket-response', (response) => {
			let parsed = parser(response)
			if (typeof callback === 'function')
				callback(parsed)
			this.queue.finished()
		})
	}

	raw (data, callback) {
		this.queue.add(this, data, callback)
	}

	send (command, p1, p2, p3) {
		let parameters = {}, options = [], callback = () => {}

		if (typeof p2 === "object") {
			parameters = p1
			options = p2
			callback = p3
		} else if (typeof p1 === "object") {
			parameters = p1
			callback = p2
		} else
			callback = p1

		if (typeof parameters === "undefined") { parameters = {} }
		if (typeof options === "undefined") { options = [] }
		if (typeof callback === "undefined") { callback = () => {} }

		let data = builder(command, parameters, options)

		this.raw(data, callback)
	}
}
