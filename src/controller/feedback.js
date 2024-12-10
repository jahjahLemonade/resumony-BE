import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {addRecordsInCollection} from '../utils/firebase.js'

export const addFeedBack = async (req, res, next) => {
  try {
    await addRecordsInCollection({
      collectionName: FIREBASE_COLLECTION.FEEDBACK,
      record: {
        ...req.body,
        userId: req?.user?.user_id,
      },
    })

    return next()
  } catch (error) {
    return next(error)
  }
}
