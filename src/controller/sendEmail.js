import {createResponsePayload} from '../utils/sendResponse.js'
import postmark from 'postmark'

export const sendEmail = (req, res, next) => {
  try { 
    console.log('sendEmail', req.body)
    const {message} = req.body
    var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)

    client.sendEmail({
      From: 'support@resumony.io',
      To: 'support@resumony.io',
      Subject: `Feedback from ${req.user.email}`,
      HtmlBody:
        '<html><body><strong>Feedback:</strong><br>' +
        message +
        '</body></html>',
      TextBody: 'Feedback: ' + message,
      MessageStream: 'outbound',
    })
    return res.json(
      createResponsePayload({
        message: 'Email send successfully!',
      }),
    )
  } catch (error) {
    console.log(error)
    next(error)
  }
}
