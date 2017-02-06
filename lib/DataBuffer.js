const WELCOME_MSG = 'Welcome to the TeamSpeak 3 ServerQuery interface, type "help" for a list of commands and "help <command>" for information on a specific command.'

module.exports = class DataBuffer {
	constructor (fn) {
		this.fn = fn
		this.lines = []
	}

	check () {
		if (this.lines.length === 0) return
		const re = /^error id=[0-9]+ msg=.+$/

		let index = -1
		for (let [i, line] of this.lines.entries()) {
			if (re.test(line) || line === WELCOME_MSG) {
				index = i
				break
			}
		}

		if (index !== -1) {
			let l = this.lines.splice(0, index + 1)
			this.fn(l.join('\n\r'))
			this.check()
		}
	}

	push (data) {
		let d = data.split('\n\r')
		for (let line of d)
			if (line.length !== 0)
				this.lines.push(line)

		this.check()
	}
}
