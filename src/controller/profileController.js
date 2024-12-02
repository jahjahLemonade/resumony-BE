import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {getRecordByIdFromCollection} from '../utils/firebase.js'
import {createResponsePayload} from '../utils/sendResponse.js'

export const getCurrentUserInfo = async (req, res, next) => {
  try {
    const paymentInfo = await getRecordByIdFromCollection({
      recordId: req.user.user_id,
      collectionName: FIREBASE_COLLECTION.PAYMENTS,
    })
    const apiKey = await getRecordByIdFromCollection({
      recordId: req.user.user_id,
      collectionName: FIREBASE_COLLECTION.OPEN_AI_KEYS,
    })
    return res.json(
      createResponsePayload({
        user: {...req.user, openAiKeyPresent: Boolean(apiKey?.apiKey)},
        paymentInfo,
      }),
    )
  } catch (e) {
    console.log({e})
    next(e)
  }
}
