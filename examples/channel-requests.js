// creates a permanent channel for a user when they join HELP_CHANNEL_NAME
// if they don't own one already
//
// requires a channel on the server with the name HELP_CHANNEL_NAME

const Cactus = require('cactus-ts')

let bot = new Cactus(process.env.TS_PASS)

bot.on('ready', () => {
	const HELP_CHANNEL_NAME = 'Channel Requests [BOT]'
	const USER_HAS_CHANNEL_ALREADY_MSG = 'looks like you own a channel already: '
	const CHANNEL_CREATED_SUCCESS_MSG = 'channel created successfully!'
	const CHANNEL_ADMIN_GID = '5'

	bot.send('channelfind', {pattern: HELP_CHANNEL_NAME}, (res) => {
		if (res.err.id !== '0') {
			console.log('given help channel doesn\'t exist')
		} else {
			bot.register('client-moved', res.body.cid, (res) => {
				let clid = res.body.clid

				bot.send('clientinfo', {clid: res.body.clid}, (res) => {
					let cldbid = res.body.client_database_id
					let client_nickname = res.body.client_nickname

					bot.send('channellist', (res) => {
						let channels = res.body

						bot.send('channelgroupclientlist',  (res) => {
							if (res.err.id === '0') {
								if (!Array.isArray(res.body)) res.body = [res.body]

								let already_owns_channel = false

								for (let set of res.body) {
									
									if (cldbid === set.cldbid && set.cgid === CHANNEL_ADMIN_GID) {
										let name = ''
										for (let channel of channels) {
											if (channel.cid === set.cid) {
												name = channel.channel_name
												break
											}
										}
										bot.send('clientpoke', {
											clid: clid, 
											msg: USER_HAS_CHANNEL_ALREADY_MSG + name
										})
										bot.send('clientkick', {
											clid: clid,
											reasonid: 4
										})
										already_owns_channel = true
										break
									}
								}

								if (!already_owns_channel) {
									bot.send('channellist', (res) => {
										let last_channel_name = res.body[res.body.length - 1].channel_name

										let channel_prefix = ''
										try {
											channel_prefix_num = last_channel_name.split('. ')[0] 
											channel_prefix_num = parseInt(channel_prefix_num) + 1
											channel_prefix = channel_prefix_num + '. '
										} catch (e) {}

										bot.send('channelcreate', {
											channel_name: channel_prefix + client_nickname,
											channel_flag_permanent: 1
										}, (res) => {

											if (res.err.id !== '0') {
												bot.send('clientpoke', {clid: clid, msg: 'coś się popsuło...' + res.err.msg})
											} else {
												bot.send('clientmove', {clid: clid, cid: res.body.cid})
												bot.send('setclientchannelgroup', {
													cgid: CHANNEL_ADMIN_GID,
													cid: res.body.cid,
													cldbid: cldbid
												})
												bot.send('clientpoke', {clid: clid, msg: CHANNEL_CREATED_SUCCESS_MSG})
											}
										})
									})
								}
							}
						})
					})
				})
			})
		}
	})
})
