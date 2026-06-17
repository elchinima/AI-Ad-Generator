import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import adsController from './controllers/adsController.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/ads', adsController)

app.use(express.static(path.join(__dirname, '../dist')))

app.get('/{*path}', (request, response) => {
  response.sendFile(path.join(__dirname, '../dist', 'index.html'))
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({
    message: 'Something went wrong while generating the ad.',
  })
})

app.listen(port, () => {
  console.log(`AI Ad Generator server is running on port ${port}`)
})