# cactus

helper library for the TeamSpeak 3 [ServerQuery](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf)

# example

```javascript
const Cactus = require('cactus-ts')

let bot = new Cactus('hunter1')

bot.on('ready', () => {
	bot.send('sendtextmessage', {
		target: 2,
		targetmode: 1,
		msg: 'hello world'
	}, (res) => {
		console.log(res)
		// { err: { id: '0', msg: 'ok' },
		//   body: 
		//    { notifytextmessage: null,
		//      targetmode: '1',
		//      msg: 'hello world',
		//      target: '2',
		//      invokerid: '5',
		//      invokername: 'cactus',
		//      invokeruid: 'serveradmin' } }
		// 	})
})
```

# usage

## getting started

### `new Cactus(password || options)`

Returns a new instance of `Cactus` and will try to connect to a server, provided that `opts.connect` isn't set to `false`.

#### `options`

- `opts.password` - password used for identification; if you don't know what it is - click [here](https://support.teamspeakusa.com/index.php?/Knowledgebase/Article/View/326/16/how-do-i-change-or-reset-the-password-of-the-serveradmin-server-query-account) **(required)**
- `opts.login` (default `serveradmin`)
- `opts.ip` (default `localhost`) - ip to which the client will try to connect to
- `opts.port` (default `10011`) - same as above
- `opts.server_number` (default 1) - sets the server index for the `use x` command, leave as default if you don't know what that is
- `opts.connect` (default `true`) - determines whether the bot should attempt connecting immediately
- `opts.display_name` (default `Cactus`) - the name that the bot will appear as

## events
Cactus extends your old and loved [EventEmitter](https://nodejs.org/api/events.html), and will emit the following events

### `.on('ready', [callback])` *-> cb()*
Probably the only one you'll ever need, gets emitted when all the boring stuff is finished and the bot is ready to accept commands.

### `.on('motd', [callback])` *-> cb(msg)*
Emitted when the server sends out its welcome message, 

# methods

### `.connect([ip, [port]])`
Use this if you have `opts.connect` set to `false`. Attempts to connect to a server at the given address.

### `.send(command, [[[parameters, [[options, [callback])` *-> cb(res)*

```js
res => {
	err: {id: '0', msg: 'ok'},
	body: {
		version: '3.0.0-alpha4',
		build: '9155',
		platform: 'Linux'
	}
}
```

Prepares a nicely escaped `command` with optionals `parameters` and `options`, passes `res` in the given format above to the callback. Refer to the [tests](https://github.com/Nikersify/cactus/blob/master/test/builder.js).
- `command`#**String** of lowercase letters only, refer to the [pdf](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf) **(required)**
- `parameters`#**Object** containing your keys and values
- `options`#**Array** with different switches for your command --without-- the dash (e.g. `uid`, `away`)

See the [tests](https://github.com/Nikersify/cactus/blob/master/test/builder.js) for examples of usage.

### `.raw(string, [callback])` *-> cb(res)*
Queries a raw string of the command to the server, has to be escaped (page 5 in the [pdf](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf#5)). Passes `res` to the callback.

### `.register(type, [id], [callback])` *-> cb(res)*
Registers callbacks to special events emitted by the server, provided that you ask it nicely. `type` depends on the *type* of events you want to register, so `type` is:

- messages
	- `private-message` - listen to all private messages sent to the bot, this also includes your own messages that you send to others, so be sure to put a check in place for that.
	- `channel-message` - **requires `id`** - get messages in the channel referred to by the `id`
	- `server-message` - all messages in the global server channel
- `client-moved` - **requires `id`** - fires whenether a user switches to, or gets moved into a channel.
- `client-joined` - listen to clients joining the server, or more specifically your bot's **view,** if you have weird permissions for the SQ on your server.
- `client-left` - same as above, but with leaving.

# install

`npm install --save cactus-ts`

# license

MIT
