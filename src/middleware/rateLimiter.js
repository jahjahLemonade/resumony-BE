import rateLimit from 'express-rate-limit'

export const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 60 * 1000, // 1 hrs in milliseconds
  max: 100,
  message: 'You have exceeded the 100 requests in 1 hrs limit!',
  standardHeaders: true,
  legacyHeaders: false,
})