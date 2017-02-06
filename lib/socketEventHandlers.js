const parser = require('./parser')

module.exports = class Handlers {
	constructor (that) {
		this.that = that
	}

	close (e) {
		console.log('close', e)
	}

	connect (e) {
		this.raw(`login ${this.config.login} ${this.config.password}`, (res) => {
			if (res.err.id !== '0')
				throw new Error(res.err.msg)
		})

		this.raw(`use ${this.config.server_number}`, (res) => {
			if (res.err.id !== '0')
				throw new Error(res.err.msg)
		})

		this.send('clientupdate', {client_nickname: this.config.display_name}, (res) => {
			if (res.err.id !== '0')
				throw new Error(res.err.msg)

			console.log('config done, can accept user commands now')
			this.emit('ready')
		})

		this.emit('commands-ready')

		this.connectionKeepAlive(true)
	}

	data (e) {
		let data = parser(e)
		
		switch (e.split(' ')[0]) {
			case 'notifytextmessage':
				if (data.body && data.body.invokeruid !== 'serveradmin') {
					switch (data.body.targetmode) {
						case '1':
							return this.dispatch('private-message', data)
						case '2':
							return this.dispatch('channel-message', data)
						case '3':
							return this.dispatch('server-message', data)
					}
				}
				break;
			case 'notifyclientmoved':
				return this.dispatch('client-moved', data)
			case 'notifycliententerview':
				return this.dispatch('client-joined', data)
			case 'notifyclientleftview':
				return this.dispatch('client-left', data)
		}

		return this.dataBuffer.push(e)
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
