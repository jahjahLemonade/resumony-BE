import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split('Bearer ')?.[1]
  console.log({token})
  if (!token) return next(createHttpError(401, {message: 'Access denied'}))
  try {
    const decoded = jwt.decode(token)
    console.log({decoded})
    req.user = decoded
    next()
  } catch (error) {
    console.log({error})
    return next(createHttpError(401, {message: 'Access denied'}))
  }
}
