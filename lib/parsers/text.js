module.exports = function(source, filename) {
    const text = JSON.stringify(source)
    return { code: `module.exports = ${text}` }
}