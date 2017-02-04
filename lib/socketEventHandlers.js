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
		
		if (data.hasOwnProperty('body')) {
			if ('notifytextmessage' in data.body && data.body.invokeruid !== 'serveradmin') {
				switch (data.body.targetmode) {
					case '1':
						this.dispatch('private-message', data)
						break
					case '2':
						this.dispatch('channel-message', data)
						break;
					case '3':
						this.dispatch('server-message', data)
						break;
				}

				return
			}

			if ('notifyclientmoved' in data.body) {
				this.dispatch('client-moved', data)
				return
			}

			if ('notifycliententerview' in data.body) {
				this.dispatch('client-joined', data)
				return
			}

			if ('notifyclientleftview' in data.body) {
				this.dispatch('client-left', data)
				return
			}
		}

		this.emit('command-response', data)
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
