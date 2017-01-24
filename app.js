const Cactus = require('./lib/Cactus')

let bot = new Cactus('pIqmSeQI')

bot.on('ready', () => {
	bot.send('sendtextmessage', {
		target: 2,
		targetmode: 1,
		msg: "hello world"
	}, (res) => {
		console.log(res)
	})
})

process.stdin.on('readable', () => {
	let chunk = process.stdin.read()
	if (chunk !== null)
		bot.raw(chunk, (res) => {
			console.log(res)
		})
})
