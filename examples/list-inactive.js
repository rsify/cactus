// print all root level channel on server and the days they have been empty for

const Cactus = require('cactus-ts')

let bot = new Cactus(process.env.TS_PASS)

bot.on('ready', () => {
	bot.send('channellist', (res) => {
		for (let channel of res.body) {
			if (channel.pid === '0') {
				bot.send('channelinfo', {cid: channel.cid}, (res) => {
					let daysEmpty = Math.round(parseInt(res.body.seconds_empty) / (60*60*24))
					console.log(channel.channel_name + ' - ' + daysEmpty + ' day(s)')
				})
			}
		}
	})
})
