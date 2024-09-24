const http = require('http')
const express = require('express')
const dotenv = require('dotenv')
dotenv.config()

const connectDB = require('./app/db.config') // Adjust the path if necessary
const { initializeAllModels } = require('./app/models/dbModel') // Import model initialization function

// Connect to MongoDB
connectDB("mongodb://localhost:27017/finaceIndia").then(async () => {
  // Initialize models after successful DB connection
  await initializeAllModels() 
})

const app = express() // Create an Express app
const server = http.createServer(app) // Create an HTTP server
const PORT = process.env.PORT || 3000 // Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
app.use(express.json())  // For parsing application/json
const routes = require('./app/routes') // Unified routes file

app.get("/", (req, res) => {
  res.json({ message: "This is API Interface" })
})

app.use('/api', routes)

