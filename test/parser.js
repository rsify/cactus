const test = require('tape')
const parser = require('../lib/parser')
const builder = require('../lib/builder')

test('parser', (t) => {
	let out, input, err = {id: '0', msg: 'ok'}

	string = 'error id=0 msg=0\n\r'
	input = parser(string)
	out = {
		raw: string,
		err: {
			id: '0',
			msg: '0'
		}
	}
	t.deepEqual(input, out, 'error info only')

	string = 'version=3.0.0-alpha4 build=9155 platform=Linux\n\rerror id=0 msg=ok\n\r'
	input = parser(string)
	out = {
		raw: string,
		err: err,
		body: {
			version: '3.0.0-alpha4',
			build: '9155',
			platform: 'Linux'
		}
	}
	t.deepEqual(input, out, 'body with properties')

	string = 'cid=1 pid=0 channel_name=default|cid=2 pid=0 channel_name=other\n\rerror id=0 msg=ok\n\r'
	input = parser(string)
	out = {
		raw: string,
		err: err,
		body: [
			{
				cid: '1',
				pid: '0',
				channel_name: 'default'
			},
			{
				cid: '2',
				pid: '0',
				channel_name: 'other'
			}
		]
	}
	t.deepEqual(input, out, 'array of properties')

	string = 'channel_name=lorem\\\\ipsum\\\/de\\samore\\tmi\\nsenore\n\rerror id=0 msg=ok\n\r'
	input = parser(string)
	out = {
		raw: string,
		err: err,
		body: {
			channel_name: "lorem\\ipsum\/de amore	mi\nsenore"
		}
	}
	t.deepEqual(input, out, 'unescaped properties')

	t.end()
})
