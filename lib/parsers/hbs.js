const handlebars = require('handlebars')
const util = require('util')

patchHandlebars(handlebars)

module.exports = function(source, filename) {
    try {
        const text = handlebars.precompile(source)
        return { code: `module.exports = Handlebars.template(${text})` }
    } catch (ex) {
        const msg = util.inspect(ex).replace(/^Error:\s+/, '')
        throw new Error(filename + ', ' + msg)
    }
}

// patch for handlebars
function patchHandlebars(Handlebars) {
    Handlebars.JavaScriptCompiler.prototype.preamble = function() {
        var out = []

        if (!this.isChild) {
            var namespace = this.namespace
            var lines = []
            lines.push(`  helpers = helpers || {}
  for (var key in ${namespace}.helpers) {
    helpers[key] = helpers[key] || ${namespace}.helpers[key]
  }`)
            if (this.environment.usePartial) {
                lines.push(`  partials = partials || ${namespace}.partials`)
            }
            if (this.options.data) {
                lines.push(`  data = data || {}`)
            }
            out.push(lines.join('\n'))
        } else {
            out.push('')
        }

        if (!this.environment.isSimple) {
            out.push(', buffer = ' + this.initializeBuffer())
        } else {
            out.push('')
        }

        // track the last context pushed into place to allow skipping the
        // getContext opcode when it would be a noop
        this.lastContext = 0
        this.source = out
    }
}