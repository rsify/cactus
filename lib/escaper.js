const CHARS = ['\\', '\\\\', '\/', '\\\/', ' ', '\\s', '|', '\\p', '\n', '\\n', '\r', '\\r', '\t', '\\t', '\v', '\\v']

module.exports = (string) => {
	if (typeof string !== 'string') string = string.toString()

	for (let i = 0; i < CHARS.length; i = i + 2) {
		const ch = CHARS[i]
		const rp = CHARS[i + 1]
		string = string.split(ch).join(rp)
	}

	return string
}

module.exports.CHARS = CHARS
