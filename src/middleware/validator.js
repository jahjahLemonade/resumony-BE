import createHttpError from 'http-errors'
//* Include all validators
import Validators from '../validators/index.js'

export function validatorMiddleWare(validator) {
  //! If validator is not exist, throw err

  if (!Validators.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator is not exist`)

  return async function (req, res, next) {
    try {
      const validated = await Validators[validator].validateAsync(req.body)
      req.body = validated
      return next()
    } catch (err) {
      console.log('Error')
      //* Pass err to next
      //! If validation error occurs call next with HTTP 422. Otherwise HTTP 500
      if (err.isJoi) return next(createHttpError(422, {message: err.message}))
      return next(createHttpError(500))
    }
  }
}
