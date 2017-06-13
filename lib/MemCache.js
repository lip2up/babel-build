const defOpts = {
    maxCount: 10000,
    debug: false,
    ttl: 60 * 60 * 1000,
    gcRate: .9,
}

class MemCache {
    constructor(opts) {
        this.opts = Object.assign({}, defOpts, opts)
        this.list = []
        this.indexMap = {}
    }

    set(key, val) {
        const item = this.getItem(key)
        if (item != null) {
            item.val = val
            item.time = Date.now()

            this.trace(`~~~ update ${key}`)
        } else {
            const emptyIndex = this.findEmptyIndex()

            const index = emptyIndex >= 0 ? emptyIndex : this.list.length
            this.list[index] = { key, val, time: Date.now() }
            this.indexMap[key] = index

            this.trace(`### put ${key} into index ${index}`)
        }
    }

    get(key) {
        const item = this.getItem(key)
        if (item != null) {
            item.time = Date.now()

            this.trace(`*** get ${key}, update time`)

            return item.val
        }
    }

    getItem(key) {
        const index = this.indexMap[key]
        return this.list[index]
    }

    findEmptyIndex() {
        const now = Date.now()

        if (this.list.length >= this.opts.maxCount) {
            this.trace(`=== findEmptyIndex start`)

            // TODO: use gc to clean items
            let findIndex = this.list.findIndex(it => it == null)
            if (findIndex == -1) {
                findIndex = this.findOldestIndex()
            }

            this.trace(`=== findEmptyIndex end, cost: ${Date.now() - now}ms, find index: ${findIndex}`)

            return findIndex
        }
    }

    findOldestIndex() {
        const { index: findIndex } = this.list.reduce((res, it, index) => {
            return it.time <= res.time ? { index, time: it.time } : res
        }, { index: -1, time: Date.now() })

        this.trace('!!! findOldestIndex')

        return findIndex
    }

    // TODO: add gc
    // gc() {
    //     const emptyList = this.list.filter(it => it == null)
    // }

    trace(msg) {
        this.opts.debug && console.log(`--> MemCache[${this.list.length}]: ${msg}`)
    }

    // advanced methods
    cached(key, getAct) {
        let val = this.get(key)

        if (val == null) {
            val = getAct()
            this.set(key, val)
        }

        return val
    }

    asyncCached(key, done, getActAsync) {
        let val = this.get(key)

        if (val == null) {
            getActAsync(val => {
                this.set(key, val)
                done(val, { cached: false })
            })
        } else {
            done(val, { cached: true })
        }
    }
}

module.exports = MemCache