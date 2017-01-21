const CHARS = require('./escaper').CHARS

module.exports = (string) => {
	if (typeof string !== 'string') return string

	for (let i = 0; i < CHARS.length; i = i + 2) {
		const ch = CHARS[i]
		const rp = CHARS[i + 1]
		string = string.split(rp).join(ch)
	}

	return string
}
