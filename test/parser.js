const test = require('tape')
const parser = require('../lib/parser')
const builder = require('../lib/builder')

test('parser', (t) => {
	let out, input, err = {id: '0', msg: 'ok'}

	input = parser('error id=0 msg=0')
	out = {
		err: {
			id: '0',
			msg: '0'
		}
	}
	t.deepEqual(input, out, 'error info only') 

	input = parser('version=3.0.0-alpha4 build=9155 platform=Linux\nerror id=0 msg=ok')
	out = {
		err: err,
		body: {
			version: '3.0.0-alpha4',
			build: '9155',
			platform: 'Linux'
		}
	}
	t.deepEqual(input, out, 'body with properties')
	
	input = parser('cid=1 pid=0 channel_name=default|cid=2 pid=0 channel_name=other\nerror id=0 msg=ok') 
	out = {
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

	input = parser('channel_name=lorem\\\\ipsum\\\/de\\samore\\tmi\\nsenore\nerror id=0 msg=ok')
	out = {
		err: err,
		body: {
			channel_name: "lorem\\ipsum\/de amore	mi\nsenore"
		}
	}
	t.deepEqual(input, out, 'unescaped properties')

	t.fail('todo: multi line input loaded from file')

	t.end()
})
