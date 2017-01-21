module.exports = class Handlers {
	constructor (that) {
		this.that = that
	}

	close (e) {
		console.log('close', e)
	}

	connect (e) {
		this.raw('login serveradmin pIqmSeQI')
		this.raw('use 1')
		this.send('clientupdate', {client_nickname: 'cactus'}, () => {
			console.log('config done, can accept user commands now')
			this.events.emit('ready')
		})
		
		this.events.emit('commands-ready')

		this.connectionKeepAlive(true)
	}

	data (e) {
		// console.log('<data>', e, '</data>')
		let response = e
		this.events.emit('socket-response', response)
	}

	drain (e) {
		console.log('drain', e)
	}

	end (e) {
		console.log('end', e)
		this.connectionKeepAlive(false)
	}

	error (e) {
		throw new Error(e)
	}

	lookup (e) {
		console.log('lookup', e)
	}

	timeout (e) {
		throw new Error(e)
	}
}
