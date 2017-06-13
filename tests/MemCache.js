const MemCache = require('../MemCache')

const maxCount = 20000

const cache = new MemCache({
    maxCount: maxCount,
    debug: true,
    gcRate: .9,
    ttl: 10 * 1000,
    gcAgainTimeAtOverflow: 1 * 1000,
})

function rand(max) {
    return Math.floor(Math.random() * max)
}

const keyList = [ 'a', 'b', 'c', 'd', 'e' ]

function randSet() {
    const index = rand(1000)
    const key = keyList[index] || 'key' + index
    cache.set(key, rand(100))
}

let longList = []
for (let i = 0; i < 10000; i++) {
    longList.push('abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890')
}
let longStr = longList.join('\n')

// console.log(longStr.length)
// throw 1

cache.opts.debug == false
for (let i = 0; i < (maxCount - 5); i++) {
    cache.set('haha' + i, longStr + i)
}
cache.opts.debug == true

function randGet() {
    const index = rand(10)
    const key = keyList[index] || 'key' + index
    cache.get(key)
}

setInterval(() => {
    randSet()
    randGet()
}, 500)
