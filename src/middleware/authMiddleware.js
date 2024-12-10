import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split('Bearer ')?.[1]
  if (!token) return next(createHttpError(401, {message: 'Access denied'}))
  try {
    const decoded = jwt.decode(token)
    req.user = decoded
    next()
  } catch (error) {
    return next(createHttpError(401, {message: 'Access denied'}))
  }
}
