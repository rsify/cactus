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
		let lines = e.split('\n\r')
		for (let line of lines)
			if (line.length !== 0) {
				let data = parser(line)

				switch (line.split(' ')[0]) {
					case 'notifytextmessage':
						if (data.body && data.body.invokeruid !== 'serveradmin') {
							switch (data.body.targetmode) {
								case '1':
									this.dispatch('private-message', data)
									continue
								case '2':
									this.dispatch('channel-message', data)
									continue
								case '3':
									this.dispatch('server-message', data)
									continue
							}
						}
						break;
					case 'notifyclientmoved':
						this.dispatch('client-moved', data)
						continue
					case 'notifycliententerview':
						this.dispatch('client-joined', data)
						continue
					case 'notifyclientleftview':
						this.dispatch('client-left', data)
						continue
				}

				this.dataBuffer.push(line)
			}
	}

	handleLine(line) {
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
