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
	sock.write('sendtextmessage target=2 targetmode=1 msg=hello\\sworld\n')

	// (can't know which channel event originated from)
	// sock.write('servernotifyregister event=channel id=1\n') // channel switching, id required
	// notifyclientmoved ctid=2 reasonid=0 clid=3

	// sock.write('servernotifyregister event=textprivate\n') // all private msg, including your own!!11
	// notifytextmessage targetmode=1 msg=je target=13 invokerid=3 invokername=Niker invokeruid=lugH8CEMs26SceRderQ4J1NX1fI=

	// (can't know which channel message was in)
	// sock.write('servernotifyregister event=textchannel id=1\n') // message in channel, id required
	// notifytextmessage targetmode=2 msg=y invokerid=3 invokername=Niker invokeruid=lugH8CEMs26SceRderQ4J1NX1fI=

	// sock.write('servernotifyregister event=textserver\n') // messages in global channel
	// notifytextmessage targetmode=3 msg=testtt invokerid=3 invokername=Niker invokeruid=lugH8CEMs26SceRderQ4J1NX1fI=

	// sock.write('servernotifyregister event=server\n') // server events, client
	// notifyclientleftview cfid=1 ctid=0 reasonid=8 reasonmsg=leaving clid=3
	// notifycliententerview cfid=0 ctid=1 reasonid=0 clid=2 client_unique_identifier=lugH8CEMs26SceRderQ4J1NX1fI= client_nickname=Niker client_input_muted=0...

	// events:
	// notifyclientmoved
	// notifyclientleftview
	// notifycliententerview
	// notifytextmessage

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
