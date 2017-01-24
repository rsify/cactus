const unescaper = require('./unescaper')

module.exports = (data) => {
	let out = {}

	let lines = data.split('\n\r')
	lines.splice(lines.length - 1, 1)

	if (lines.length === 0)
		return {}

	let lastLine = lines[lines.length - 1]

	if (lastLine.indexOf('error ') === 0) {
		out.err = parseString(lastLine)
		delete out.err.error
		lines.splice(lines.length - 1, 1)
	}

	if (lines.length > 1) {
		out.data = lines.join('\n')
	} else if (lines.length === 1) {
		let line = lines[0]
		let arr = line.split('|')
		let outArr = []

		for (let i = 0; i < arr.length; i++) {
			outArr.push(parseString(arr[i]))
		}

		if (outArr.length === 1)
			out.body = outArr[0]
		else
			out.body = outArr
	}

	out.raw = data

	return out
}

const parseString = (string) => {
	let obj = {}

	let words = string.split(' ')

	for (let i = 0; i < words.length; i++) {
		words[i] = unescaper(words[i])
	}

	for (let i = 0; i < words.length; i++) {
		let key, value, word = words[i]
		let index = word.indexOf('=')

		if (index < 0) {
			key = words[i]
			value = null
		} else {
			key = word.substr(0, index)
			value = word.substr(index + 1)
		}

		obj[key] = unescaper(value)
	}

	return obj
}
