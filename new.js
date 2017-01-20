const repl = require('repl')

const Cactus = require('./lib/cactus')

let bot = new Cactus().start()

bot.send('use 1', Cactus.log)
