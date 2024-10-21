// Need to import dotenv and config it
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const { OpenAI } = require('openai');
var postmark = require("postmark");

//Adding stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// app setup
const express = require('express');
const app = express();
// const cors = require('cors');

// middleware
app.use(express.json());
app.use(express.static('public'));

// cors middleware
app.use((req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://resumony-fe.vercel.app"
    )
    next();
  }
);

const { initializeApp } = require("firebase/app")
// const { getAnalytics } = require("firebase/analytics")
// const { collection, deleteDoc, query, where, getDocs } = require("firebase/firestore");

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: "resumony",
  storageBucket: "resumony.appspot.com",
  messagingSenderId: "515722153612",
  appId: "1:515722153612:web:3fc00ff43fd52e1bb4b5a9",
  measurementId: "G-7XDDEQ48V6"
};

const fb = initializeApp(config);
// const analytics = getAnalytics(fb);
// analytics.isSupported(analytics)

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/client/public/index.html');
// });

//Config OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// app.get("/prices", async (req, res) => {
//   const prices = await stripe.prices.list();
//   res.status(200).json({ prices });
// });

app.post('/create-checkout-session-monthly', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        // testing
        // price: "price_1PROygP7QEN5uEyKf3TcQa39",
        price: 'price_1PcZ0mP7QEN5uEyKOwwcpgJZ',
        quantity: 1,
      },
    ],
    ui_mode: 'embedded',
    return_url: "https://resumony-fe.vercel.app/return?session_id={CHECKOUT_SESSION_ID}",
  })
  res.send({ clientSecret: session.client_secret });
});

app.post('/create-checkout-session-front-end', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        // testing price
        // price: "price_1PROwbP7QEN5uEyKYZObimfg",
        price: 'price_1PRM4MP7QEN5uEyK2aAp9jxH',
        quantity: 1,
      },
    ],
    ui_mode: 'embedded',
    return_url: "https://resumony-fe.vercel.app/return?session_id={CHECKOUT_SESSION_ID}",
  })
  res.send({ clientSecret: session.client_secret });
});

app.post('/subscription-status', async (req, res) => {
  const { subId } = req.body
  // console.log(">>>", subId)
  const subscription = await stripe.subscriptions.retrieve(
    subId
  );

  // I need renewal date and current status of subscription
  res.send({
    status: subscription.status,
    renewal_date: subscription.current_period_end
  });
});

app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
    subID: session.subscription
  });
});

// Payment route
app.post('/payment', async (req, res) => {
  const { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Resumony Payment",
      payment_method: id,
      confirm: true
    });
    console.log(payment);
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
});

app.post('/createResume', (req, res) => {
  // Run thru AI model to get the output
  // Output will be editing of the resume
  // Output returned needs to be converted to type string

  const { summary, role, experience, skills, company, resp, qual } = req.body;
  openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
          You are a professional resume writer skilled in tailoring resumes to match specific job requirements. 
          Your task is to create a customized resume that highlights the candidate's strengths and aligns them with the job responsibilities and qualifications.
        `
      },
      { role: "user",
        content: `Based on this ${resp} and ${qual} for a ${role} role at ${company}, Rewrite the resume summary to include Keywords mentioned in Job Description. Only using info found on my resume, rewrite my work experience to be more tailored for this ${role}.`},
      { role: "user",
        content: `I have a info from my resume that I would like you to review and edit. Here are the details of my resume info... \n Summary: ${summary}\n Experience: ${experience}\n Skills: ${skills}` }
      ],
    // seed: 11,
    model: "gpt-4o-mini",
    response_format: { "type": "json_object" }
  }).then((resp) => {
    console.log(resp)
    res.send(resp.choices[0].message)
  }).catch(console.error);
})

// Send an email
app.post('/sendEmail', (req, res) => {
  try {
    const { feedback, email } = req.body;

    var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

    client.sendEmail({
      "From": "support@resumony.io",
      "To": "support@resumony.io",
      "Subject": `Feedback from ${email}`,
      "HtmlBody": "<html><body><strong>Feedback:</strong><br>" + feedback + "</body></html>",
      "TextBody": "Feedback: " + feedback,
      "MessageStream": "feedback"
    });
    res.send('Email sent');
  } catch (error) {
    console.log(error);
    res.send('Error sending email');
  }
});

// Run server

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// So this will be grabbing the build directory from a front-end repo and serving it

// app.use(express.static(path.join(__dirname, "build")));
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// });

var server = app.listen(process.env.PORT || 3001, () => {
  console.log("Listening on port %d", server.address().port);
});
