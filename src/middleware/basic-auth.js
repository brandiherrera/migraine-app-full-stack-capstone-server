function requireAuth(req, res, next) {
    console.log('requireAuth')
    console.log(req.get('authorization'))
    next()
}

module.exports = {
    requireAuth,
}