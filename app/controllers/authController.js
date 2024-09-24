const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const models = require('../models/genericModel')

// Register a new user
const register = async (req, res) => {
  const { username, password, role } = req.body
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new models.User({ username, password: hashedPassword, role })
    await user.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Login and generate JWT token
const login = async (req, res) => {
  const { username, password } = req.body
  
  try {
    const user = await models.User.findOne({ username })
    if (!user) return res.status(400).json({ error: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = { register, login }
