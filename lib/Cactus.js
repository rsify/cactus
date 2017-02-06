const util = require('util')
const Queue = require('./queue')
const Handlers = require('./socketEventHandlers')
const EventEmitter = require('events')
const builder = require('./builder')
const parser = require('./parser')

const CONFIG_DEFAULTS = {
	login: 'serveradmin',
	ip: 'localhost',
	port: 10011,
	display_name: 'Cactus',
	server_number: 1,
	connect: true
}

module.exports = class Cactus extends EventEmitter {
	constructor (p1) {
		super()
		
		let config = {}
		if (typeof p1 === 'string')
			config.password = p1
		else if (typeof p1 === 'object') {
			config = p1
		}

		for (let DEFAULT in CONFIG_DEFAULTS) {
			if (typeof config[DEFAULT] === 'undefined')
				config[DEFAULT] = CONFIG_DEFAULTS[DEFAULT]	
		}

		if (typeof config.password !== 'string') {
			console.error('you need to provide a password for cactus')
			throw new Error('no password')
		}
		
		this.config = config

		this.queue = new Queue(this.poppable)
		this.socketEventHandlers = new Handlers(this)

		this.sock = new require('net').Socket()
		this.sock.setEncoding('utf8')
		if (this.config.connect)
			this.connect(this.config.port, this.config.ip)

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

	connect (p1, p2) {
		if (typeof p2 !== 'undefined') {
			this.config.port = p1
			this.config.ip = p2
		} else if (typeof p1 !== 'undefined')
			this.config.ip = p2

		this.listeners = []
		this.registered = []

		this.sock.connect(this.config.port, this.config.ip)
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

	dispatch (event, data) {
		switch (event) {
			case 'private-message':
			case 'server-message':
			case 'client-joined':
			case 'client-left':
				for (let listener of this.listeners) {
					if (listener.event === event)
						listener.callback(data)
				}
				break
			case 'channel-message':
				for (let listener of this.listeners) {
					if (listener.event === event) {
						this.send('clientinfo', {clid: data.body.invokerid}, (res) => {
							if (res.body) {
								if (res.body.cid === listener.id) {
									listener.callback(data)
								}
							}
						})
					}
				}
				break
			case 'client-moved':
				for (let listener of this.listeners) {
					if (listener.event === event) {
						this.send('clientinfo', {clid: data.body.clid}, (res) => {
							if (res.body) {
								if (res.body.cid === listener.id) {
									listener.callback(data)
								}
							}
						})
					}
				}
				break
		}
	}

	poppable (data, callback) {
		if (this.ready) {
			this.sock.write(data + '\n')
		} else
			this.once('commands-ready', () => {
				this.sock.write(data + '\n')
			})

		this.once('command-response', (response) => {
			if (typeof callback === 'function')
				callback(response)
			this.queue.finished()
		})
	}

	raw (data, callback) {
		this.queue.add(this, data, callback)
	}

	register (event, p1, p2) {
		let id = null, callback

		if (typeof p1 === 'function') callback = p1
		else if (typeof p2 === 'function') callback = p2

		if (typeof p1 === 'string') id = p1
		else if (typeof p1 === 'number') id = p1.toString()
		
		if (typeof callback === 'undefined') callback = () => {}
		
		let registeredEvent

		switch (event) {
			case 'private-message':
				// this.send('servernotifyregister', {event: 'textprivate'})
				registeredEvent = 'textprivate'
				break
			case 'channel-message':
				// this.send('servernotifyregister', {event: 'textchannel', id: id})
				registeredEvent = 'textchannel-' + id
				break
			case 'server-message':
				// this.send('servernotifyregister', {event: 'textserver'})
				registeredEvent = 'textserver'
				break
			case 'client-moved':
				// this.send('servernotifyregister', {event: 'channel'})
				registeredEvent = 'channel-' + id
				break
			case 'client-joined':
			case 'client-left':
				// this.send('servernotifyregister', {event: 'server'})
				registeredEvent = 'server'
				break
			default:
				throw new Error('invalid event name')
			}
		
		if (this.registered.indexOf(registeredEvent) < 0) {
			if (registeredEvent.indexOf('textchannel') === 0)
				this.send('servernotifyregister', {event: 'textchannel', id: id})
			else if (registeredEvent.indexOf('channel') === 0)
				this.send('servernotifyregister', {event: 'channel', id: id})
			else
				this.send('servernotifyregister', {event: registeredEvent})

			this.registered.push(registeredEvent)
		}

		let obj = {
			event: event,
			callback: callback
		}
		if (id) obj.id = id

		this.listeners.push(obj)
	}

	send (command, p1, p2, p3) {
		let parameters = {}, options = [], callback = () => {}

		if (typeof p2 === 'object') {
			parameters = p1
			options = p2
			callback = p3
		} else if (typeof p1 === 'object') {
			parameters = p1
			callback = p2
		} else
			callback = p1

		if (typeof parameters === 'undefined') parameters = {}
		if (typeof options === 'undefined') options = []
		if (typeof callback === 'undefined') callback = () => {}

		let data = builder(command, parameters, options)

		this.raw(data, callback)
	}
}
