const path = require('path')

function getJPath(p, dir, name) {
    const jpath = name.slice(0, 2) == './' || name.slice(0, 3) == '../'
        ? path.join(dir, name)
        : name
    if (jpath.slice(0, 2) != 'j/') {
        throw p.buildCodeFrameError('cannot resolve this path')
    }
    const ext = path.extname(jpath)
    return jpath + (ext == '' ? '.js' : '')
}

class DepDump {
    constructor() {
        this.cache = {}
    }

    getDeps(hash) {
        return this.cache[hash] || []
    }

    getBabelPlugin({ hash }) {
        return ({ types: t }) => {
            return {
                visitor: {
                    CallExpression: {
                        exit: (p, s) => {
                            this.babelPluginCallExpressionExit({ t, p, s, hash })
                        }
                    },
                }
            }
        }
    }

    babelPluginCallExpressionExit({ t, p, s, hash }) {
        const list = this.cache[hash] || (this.cache[hash] = [])

        if (t.isIdentifier(p.node.callee, { name: 'require' })) {
            const arg = p.get('arguments.0')
            if (arg != null) {
                if (t.isStringLiteral(arg.node)) {
                    const fname = s.file.opts.filename
                    const dir = path.dirname(fname)
                    const jpath = getJPath(arg, dir, arg.node.value)
                    arg.node.value = jpath

                    list.push(jpath)
                } else {
                    throw arg.buildCodeFrameError('cannot use expression in require')
                }
            } else {
                throw p.buildCodeFrameError('`require` must be has a argument')
            }
        }
    }
}

module.exports = DepDump