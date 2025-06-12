import createHttpError from 'http-errors'
import { PAYMENT_TYPE } from '../globalConstants.js'
import dayjs from 'dayjs'
import { getRecordByIdFromCollection, } from '../utils/firebase.js'
import { FIREBASE_COLLECTION } from '../config/firebase/constants.js'

export const paymentMiddleware = async (req, res, next) => {
  try {
    const paymentInfoRes = await getRecordByIdFromCollection({
      collectionName: FIREBASE_COLLECTION.PAYMENTS,
      recordId: req?.user?.email
    })

    const paymentInfo = paymentInfoRes?.[0]?.payments?.[
      paymentInfoRes?.[0]?.payments?.length - 1
    ]
    if (paymentInfo?.paymentStatus === 'completed') {
      
      if (paymentInfo?.subscriptionEndDate &&
        !dayjs().isAfter(paymentInfo?.subscriptionEndDate)) {
        if (paymentInfo?.plan === PAYMENT_TYPE.MONTHLY) {
          console.log("monthly subscription activated")
          req.user.openAiKey = process.env.OPENAI_API_KEY
          console.log("monthly subscription activated" ,req.user) 
          return next()
        }
      }

      if (paymentInfo?.plan === PAYMENT_TYPE.ONE_TIME) {
        const apiKey = await getRecordByIdFromCollection({
          recordId: req.user.user_id,
          collectionName: FIREBASE_COLLECTION.OPEN_AI_KEYS,
        })
        req.user.openAiKey = apiKey.apiKey
        return next()
      }
    }
    console.log({paymentInfo})
    return next(createHttpError(401, { message: 'Access denied' }))
  } catch (error) {
    console.log({error})
    return next(createHttpError(401, { message: 'Access denied' }))
  }
}
