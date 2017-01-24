module.exports = class Handlers {
	constructor (that) {
		this.that = that
	}

	close (e) {
		console.log('close', e)
	}

	connect (e) {
		this.raw(`login ${this.config.login} ${this.config.password}`)
		this.raw(`use ${this.config.server_number}`)
		this.send('clientupdate', {client_nickname: this.config.display_name}, () => {
			console.log('config done, can accept user commands now')
			this.emit('ready')
		})

		this.emit('commands-ready')

		this.connectionKeepAlive(true)
	}

	data (e) {
		// console.log('<data>', e, '</data>')
		let response = e
		this.emit('socket-response', response)
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
