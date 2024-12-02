import express, {Router} from 'express'
import {getUserByEmail} from '../controller/authentication.js'
import {createResponsePayload} from '../utils/sendResponse.js'

const publicRouter = Router()

publicRouter.route('/').get((req, res) => {
  res.send(createResponsePayload('Hello World!'))
})

publicRouter.route('/findByEmail').post(getUserByEmail)

export default publicRouter
