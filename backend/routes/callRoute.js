import express from 'express'
import authUser from '../middleware/authUser.js'
import { getCallHistory, startCall, updateCallStatus } from '../controller/callController.js'

const callRouter = express.Router()

callRouter.post('/start',          authUser, startCall)
callRouter.put('/status',          authUser, updateCallStatus)
callRouter.get('/history/:userId', authUser, getCallHistory)

export default callRouter
