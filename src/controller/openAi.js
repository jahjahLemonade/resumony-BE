import OpenAI from 'openai'
import {
  getResumeSystemPrompt,
  getResumeUserPrompt,
} from '../utils/resumePrompts.js'
import {addRecordsInCollection} from '../utils/firebase.js'
import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {createResponsePayload} from '../utils/sendResponse.js'

export const getResumeInJsonFormat = async (body, openAiKey) => {
  const {
    careerSummary,
    companyName,
    workExperience,
    role,
    responsibilities,
    skills,
    qualifications,
  } = body
  const openai = new OpenAI(openAiKey)
  const resp = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: getResumeSystemPrompt(),
      },
      {
        role: 'user',
        content: getResumeUserPrompt({
          careerSummary,
          companyName,
          workExperience,
          role,
          responsibilities,
          skills,
          qualifications,
        }),
      },
    ],
    model: 'gpt-4o-mini',
    // response_format: {type: 'json_object'},
  })
  return resp.choices[0].message.content || ''
}

// Function to check if the provided OpenAI API key is valid
async function validateOpenAIKey(apiKey) {
  try {
    const openai = new OpenAI(apiKey)
    const response = await openai.chat.completions.create({
      messages: [{role: 'user', content: 'Say this is a test'}],
      model: 'GPT-4o',
    })

    // If the request is successful, the API key is valid
    return true
  } catch (error) {
    // If there's an error (e.g., 401 Unauthorized), the API key is invalid
    if (error.response && error.response.status === 401) {
      console.log('Invalid API key')
    } else {
      console.log('Error validating API key:', error.message)
    }
    return false
  }
}

export const addOpenAiKey = async (req, res, next) => {
  try {
    // throw new Error('Failed request')
    const isValid = await validateOpenAIKey(req.body.apiKey)
    if (isValid) {
      await addRecordsInCollection({
        collectionName: FIREBASE_COLLECTION.OPEN_AI_KEYS,
        record: {
          ...req.body,
        },
        recordId: req.user.user_id,
      })
    } else {
      throw new Error('Invalid API key')
    }

    return res.json(createResponsePayload({}))
  } catch (error) {
    next(error)
  }
}
