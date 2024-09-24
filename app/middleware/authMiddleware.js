const jwt = require('jsonwebtoken')

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  // to verifying the jsonwebtoken 

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' })
    req.user = decoded
    next()
  })
  
}

// Middleware for authorization based on role
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = { authenticate, authorize }
