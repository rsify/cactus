const net = require('net')
const repl = require('repl')

let sock = new net.Socket()
sock.connect(10011, '127.0.0.1')

sock.setEncoding('utf8')
sock.setKeepAlive(true)

sock.on('connect', (e) => {
	sock.write('login serveradmin pIqmSeQI\n')
	sock.write('use 1\n')
	sock.write('clientupdate client_nickname=botty\n')
	sock.write('sendtextmessage target=1 targetmode=1 msg=hello\\sworld\n')
	sock.write('servernotifyregister event=channel\n')
	sock.write('servernotifyregister event=textprivate\n')
	sock.write('servernotifyregister event=textchannel\n')
	sock.write('servernotifyregister event=textserver\n')
	sock.write('servernotifyregister event=server\n')

	setInterval(() => {
		sock.write('\n\r')
	}, 30000)
})

sock.on('data', (e) => {
	console.log('data:', e, 'end data')
})

process.stdin.on('readable', () => {
	let chunk = process.stdin.read()
	if (chunk !== null) {
		sock.write(chunk)
	}
})

process.stdin.on('end', () => {
	process.stdout.write('end')
})
