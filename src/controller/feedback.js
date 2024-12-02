import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {addRecordsInCollection} from '../utils/firebase.js'
import {createResponsePayload} from '../utils/sendResponse.js'

export const addFeedBack = async (req, res, next) => {
  try {
    const record = await addRecordsInCollection({
      collectionName: FIREBASE_COLLECTION.FEEDBACK,
      record: {
        ...req.body,
        userId: req?.user?.user_id,
      },
    })
    return res.json(createResponsePayload(record))
  } catch (error) {
    next(error)
  }
}
