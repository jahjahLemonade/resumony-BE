import {firebase} from '../config/firebase/index.js'
import {createResponsePayload} from '../utils/sendResponse.js'

export const getUserByEmail = async (req, res, next) => {
  try {
    const user = await firebase.auth().getUserByEmail(req.body.email)
    res.json(createResponsePayload(user))
  } catch (err) {
    next(err)
  }
}
