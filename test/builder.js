const test = require('tape')
const builder = require('../lib/builder.js')

test('builder', (t) => {
	let out, message, target, params

	out = builder('clientlist')
	t.equal(out, 'clientlist', 'simple command')

	out = builder('clientinfo', {clid: 6})
	t.equal(out, 'clientinfo clid=6', 'one parameter')

	out = builder('clientdblist', {start: 1, duration: 5})
	t.equal(out, 'clientdblist start=1 duration=5', 'multiple parameters')

	out = builder('clientlist', {}, ['topic', 'flags', 'voice'])
	t.equal(out, 'clientlist -topic -flags -voice', 'command options')

	out = builder('sendtextmessage', {targetmode: 2, target: 1, msg: 'Hello World ! (triggered)'})
	t.equal(out, 'sendtextmessage targetmode=2 target=1 msg=Hello\\sWorld\\s!\\s(triggered)', 'whitespace escaping')

	message = String.fromCharCode(92, 47, 32, 124, 10, 13, 9, 11)
	out = builder('sendtextmessage', {msg: message})
	target = String.fromCharCode(92, 92, 92, 47, 92, 115, 92, 112, 92, 110, 92, 114, 92, 116, 92, 118)
	t.equal(out, `sendtextmessage msg=${target}`, 'everything escaping')

	params = {
		sgid: 13,
		perms: [
			{
				permid: 17276,
				permvalue: 50,
				permnegated: 0,
				permskip: 0
			},
			{

				permid: 21415,
				permvalue: 20,
				permnegated: 0
			}
		]
	}
	out = builder('servergroupaddperm', params)
	t.equal(out, 'servergroupaddperm sgid=13 permid=17276 permvalue=50 permnegated=0 permskip=0|permid=21415 permvalue=20 permnegated=0', 'arrays in parameters')

	t.end()
})
