const repl = require('repl')

const Cactus = require('./lib/Cactus')

let bot = new Cactus()

bot.on('ready', () => {
	bot.send('sendtextmessage', {
		target: 2,
		targetmode: 1,
		msg: "hello world"
	}, (res) => {
		console.log(res)
	})
})

