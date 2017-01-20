class module.exports {
	constructor (poppable) {
		if (typeof poppable !== 'function') throw new Error('invalid argument')

		this.poppable = poppable
		this.buffer = []
		this.busy = false
	}

	add (data, callback) {
		this.buffer.push({
			data: data,
			callback: callback
		})

		if (!this.busy) this.shift()
	}

	finished () {
		if (this.buffer.length > 0) this.shift()
		else this.busy = false
	}
	
	shift () {
		if (this.buffer.length === 0) throw new Error('empty buffer')
		this.busy = true	

		let b = this.buffer[0]

		this.poppable(b.data, b.callback)
	}
} 
