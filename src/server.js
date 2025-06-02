import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import {errorHandlerMiddleware} from './middleware/errorHandler.js'
import {authMiddleware} from './middleware/authMiddleware.js'
import publicRouter from './routes/publicRoutes.js'
import privateRouter from './routes/privateRoutes.js'
import stripeRoutes from './routes/stripeRoutes.js'
import {stripeWebHook} from './controller/stripe.js'
import {rateLimiterUsingThirdParty} from './middleware/rateLimiter.js'

dotenv.config()

const {PORT} = process.env
const app = express()
app.use(cors())

app.use(rateLimiterUsingThirdParty)

app.post('/webhook', express.raw({type: 'application/json'}), stripeWebHook)

app.use(express.json())

app.set('trust proxy', 4) // trust first proxy for rate limiting

app.use(publicRouter)

app.use(authMiddleware)

app.use(stripeRoutes)

app.use(privateRouter)

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT} 🔥`)
})

console.log('running..')