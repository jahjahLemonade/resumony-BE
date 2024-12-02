import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {createResponsePayload} from '../utils/sendResponse.js'
import {
  deleteRecordsInCollection,
  getRecordByIdFromCollection,
  getRecordsFromCollection,
  updateRecordById,
} from '../utils/firebase.js'
import {getResumeInJsonFormat} from './openAi.js'

export const createResume = async (req, res, next) => {
  try {
    const jsonFormatResponse = await getResumeInJsonFormat(
      req.body,
      req.user.openAiKey,
    )

    return res.json(createResponsePayload(jsonFormatResponse))
  } catch (error) {
    next(error)
  }
}

export const generateResume = async (req, res, next) => {
  try {
    const jsonFormatResponse = await getResumeInJsonFormat(
      req.body,
      req.user.openAiKey,
    )
    return res.json(createResponsePayload(jsonFormatResponse))
  } catch (error) {
    next(error)
  }
}

export const getResumes = async (req, res, next) => {
  try {
    const records = await getRecordsFromCollection({
      collectionName: FIREBASE_COLLECTION.RESUMES,
      conditions: {userId: req?.user?.user_id},
    })
    return res.json(createResponsePayload(records))
  } catch (error) {
    next(error)
  }
}

export const getResume = async (req, res, next) => {
  try {
    const {resumeId} = req.params
    const records = await getRecordByIdFromCollection({
      collectionName: FIREBASE_COLLECTION.RESUMES,
      recordId: resumeId,
    })
    return res.json(createResponsePayload(records))
  } catch (error) {
    next(error)
  }
}

export const updateResume = async (req, res, next) => {
  try {
    const {resumeId} = req.params
    const records = await updateRecordById({
      collectionName: FIREBASE_COLLECTION.RESUMES,
      recordId: resumeId,
      updatedData: req.body,
    })
    return res.json(createResponsePayload(records))
  } catch (error) {
    next(error)
  }
}

export const deleteResume = async (req, res, next) => {
  try {
    const {resumeId} = req.params
    const records = await deleteRecordsInCollection({
      collectionName: FIREBASE_COLLECTION.RESUMES,
      recordId: resumeId,
    })
    return res.json(createResponsePayload(records))
  } catch (error) {
    next(error)
  }
}
