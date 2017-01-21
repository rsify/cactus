module.exports = class Queue {
	constructor (poppable) {
		if (typeof poppable !== 'function') throw new Error('invalid argument')

		this.poppable = poppable
		this.buffer = []
		this.busy = false
	}

	add (that, data, callback) {
		this.buffer.push({
			that: that,
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

		let b = this.buffer.shift()
		
		this.poppable.call(b.that, b.data, b.callback)
	}
} 
