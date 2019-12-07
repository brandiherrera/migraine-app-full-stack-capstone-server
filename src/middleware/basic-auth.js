const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
    const authToken = req.get('authorization') || ''

    let basicToken
    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)

    if (!tokenUserName || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
    // req.app.get('db')('migraine_users')
    //     .where({ email: tokenUserName })
    //     .first()
        .then(user => {
            if (!user || user.password !== tokenPassword) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            next()
        })
        .catch(next)
}

module.exports = {
    requireAuth,
}