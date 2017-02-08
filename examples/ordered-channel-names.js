// rename all channels after a spacer with the name SPACER_CHANNEL_NAME
// in the following format:
//
// 2. javascript coders
// tagpro players
// 8. uber haxors
//
// to
//
// 1. javascript coders
// 2. tagpro players
// 3. uber haxors

const Cactus = require('cactus-ts')

let bot = new Cactus(process.env.TS_PASS)

bot.on('ready', () => {
	SPACER_CHANNEL_NAME = '[cspacerDO NOT DELETE]-..'
	PREVIEW = false

	bot.send('channellist', (res) => {
		let processedCIDs = []

		function walk () {
			let afterSpacer = false
			let i = 0
			for (let channel of res.body) {
				if (afterSpacer && channel.pid === '0') {
					i = i + 1
					if (channel.channel_name.indexOf(i + '. ') !== 0 &&
						processedCIDs.indexOf(channel.cid) < 0) {
						let name
						if (channel.channel_name.indexOf('. ') > 0)
							name = i + '. ' + channel.channel_name.split('. ')[1]
						else
							name = i + '. ' + channel.channel_name
						
						if (!PREVIEW)
							bot.send('channeledit', {
								channel_name: name,
								cid: channel.cid
							}, (res) => {
								processedCIDs.push(channel.cid)

								if (res.err.msg === 'ok') walk()
								else console.log(res.err.msg, name, channel.channel_name)
							})
						else {
							processedCIDs.push(channel.cid)
							console.log(channel.channel_name + ' to ' + name)
							walk()
						}

						return
					}
				}

				if (channel.channel_name === SPACER_CHANNEL_NAME) afterSpacer = true
			}
		}

		walk()
	})
})
