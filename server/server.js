require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://hojco.duckdns.org',
  credentials: true
}))

// Hash the password from .env once on startup
const PASSWORD_HASH = bcrypt.hashSync(process.env.SHOP_PASSWORD, 10)

// ── Middleware: verify JWT ──
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── POST /api/login ──
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const usernameMatch = username === process.env.SHOP_USERNAME
  const passwordMatch = bcrypt.compareSync(password, PASSWORD_HASH)

  if (!usernameMatch || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token })
})

// ── GET /api/verify ── (frontend calls this to check token is still valid)
app.get('/api/verify', auth, (req, res) => {
  res.json({ valid: true })
})

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Hojco server running on port ${PORT}`)
})