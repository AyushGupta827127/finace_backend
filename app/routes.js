const express = require('express')
const router = express.Router()

const { authenticate, authorize } = require('./middleware/authMiddleware')

const { api } = require('./controllers/apiController')

router.all('/builder/*', api.index )
// router.all('/builder/*', authenticate, authorize, api.index )

module.exports = router
