const builder = require('./builder.js')
const Queue = require('./queue')
const Handlers = require('./socketEventHandlers.js')
const EventEmitter = require('events')

module.exports = class Cactus extends EventEmitter {
	constructor () {
		super()

		this.queue = new Queue(this.poppable)
		
		this.socketEventHandlers = new Handlers(this)
		
		this.sock = new require('net').Socket()
		this.sock.setEncoding('utf8')
		this.sock.connect(10011, '127.0.0.1')

		this.sock.on('close', this.socketEventHandlers.close.bind(this))
		this.sock.on('connect', this.socketEventHandlers.connect.bind(this))
		this.sock.on('data', this.socketEventHandlers.data.bind(this))
		this.sock.on('drain', this.socketEventHandlers.drain.bind(this))
		this.sock.on('end', this.socketEventHandlers.end.bind(this))
		this.sock.on('error', this.socketEventHandlers.error.bind(this))
		this.sock.on('lookup', this.socketEventHandlers.lookup.bind(this))
		this.sock.on('timeout', this.socketEventHandlers.timeout.bind(this))
		
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
			console.log('data: ' + data, 'response: ' + response + ' end resp.')
			if (typeof callback === 'function')
				callback(response)
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
