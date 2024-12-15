import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {
  getRecordByIdFromCollection,
  getRecordsFromCollection,
} from '../utils/firebase.js'
import {createResponsePayload} from '../utils/sendResponse.js'

export const getCurrentUserInfo = async (req, res, next) => {
  try {
    // const paymentInfo1 = await getRecordByIdFromCollection({
    //   recordId: req.user.user_id,
    //   collectionName: FIREBASE_COLLECTION.PAYMENTS,
    // })
    const paymentInfo = await getRecordsFromCollection({
      collectionName: FIREBASE_COLLECTION.PAYMENTS,
      conditions: {userId: req?.user?.user_id},
      limit: 1,
    })
    const apiKey = await getRecordByIdFromCollection({
      recordId: req.user.user_id,
      collectionName: FIREBASE_COLLECTION.OPEN_AI_KEYS,
    })
    return res.json(
      createResponsePayload({
        user: {...req.user, openAiKeyPresent: Boolean(apiKey?.apiKey)},
        ...(paymentInfo?.length > 0
          ? {
              paymentInfo:
                paymentInfo[0]?.payments?.[
                  paymentInfo[0]?.payments?.length - 1
                ],
            }
          : {}),
      }),
    )
  } catch (e) {
    console.log({e})
    next(e)
  }
}
