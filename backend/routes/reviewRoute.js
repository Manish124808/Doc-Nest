import express from 'express'
import { submitRating, submitComment, editReview, deleteReview, getDoctorReviews } from '../controller/reviewController.js'
import authUser from '../middleware/authUser.js'

const reviewRouter = express.Router()

reviewRouter.post('/rate',              authUser, submitRating)
reviewRouter.post('/comment/:reviewId', authUser, submitComment)
reviewRouter.put('/edit/:id',           authUser, editReview)
reviewRouter.delete('/delete/:id',      authUser, deleteReview)
reviewRouter.get('/doctor/:id',         getDoctorReviews)

export default reviewRouter
