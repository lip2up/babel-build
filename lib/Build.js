const path = require('path')
const fs = require('fs')
const babel = require('babel-core')
const extend = require('extend')
const md5 = require('md5')

const DepDump = require('./DepDump')
const MemCache = require('./MemCache')

const hbs = require('./parsers/hbs')
const text = require('./parsers/text')

const babelOpts = require('./babelOpts')

const parserMap = {
    js(source, filename, depPlugin, runtimeOverride) {
        const opts = extend(true, { filename }, babelOpts)
        opts.plugins.push([ depPlugin ])
        if (runtimeOverride != null) {
            opts.plugins.find(it => it[0] == 'transform-runtime')[1].moduleName = runtimeOverride
        }
        return babel.transform(source, opts)
    },
    hbs,
    tpl: text,
}

class Build {
    constructor({ baseDir, debug = false }) {
        this.baseDir = baseDir
        this.depDump = new DepDump
        this.cache = new MemCache({ debug })

        this.runtimeOverride = fs.existsSync(`${baseDir}/babel-runtime`) ? `${baseDir}/babel-runtime` : null
    }

    build(jpath, depMap = {}, sourceOpt = null) {
        const result = { codeList: [], depList: [], depMap: depMap }
        this.doBuild(jpath, result, sourceOpt)
        result.codeList.push(`define.require('${jpath}')`)
        return result
    }

    doBuild(jpath, { codeList, depList, depMap }, sourceOpt = null) {
        depMap[jpath] = 1
        depList.push(jpath)

        const source = sourceOpt || fs.readFileSync(path.join(this.baseDir, jpath), { encoding: 'utf8' })
        const hash = jpath + '_' + md5(source)

        const { code, deps } = this.cache.cached(hash, () => {
            const ext = path.extname(jpath).slice(1)
            const parser = parserMap[ext]
            const { code } = parser(source, jpath, ext == 'js' ? this.depDump.getBabelPlugin({ hash }) : null, this.runtimeOverride)

            const moduleCode = `define('${jpath}', function(require, exports, module) {
${code}
}); // end of ${jpath}`

            const deps = this.depDump.getDeps(hash)

            return { code: moduleCode, deps }
        })

        codeList.push(code)

        deps.forEach(it => {
            !(it in depMap) && this.doBuild(it, { codeList, depList, depMap })
        })
    }
}

module.exports = Build