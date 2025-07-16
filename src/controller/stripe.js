import Stripe from "stripe";
import fs from "fs";
import { createResponsePayload } from "../utils/sendResponse.js";
import {
  addOrUpdatePaymentPlan,
  getRecordByIdFromCollection,
} from "../utils/firebase.js";
import { FIREBASE_COLLECTION } from "../config/firebase/constants.js";
import dayjs from "dayjs";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const createCustomer = async (req, res, next) => {
  try {
    // Step 1: Search for an existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: req.body.email,
      limit: 1, // Limit to 1 to fetch the first match (if any)
    });

    // Step 2: If a customer exists, return the existing customer
    if (existingCustomers.data.length > 0) {
      const existingCustomer = existingCustomers.data[0];
      return res.json(createResponsePayload(existingCustomer));
    }

    // Step 3: If no customer exists, create a new customer
    const newCustomer = await stripe.customers.create({
      email: req.body.email,
    });
    const payment = await stripe.paymentMethods.attach("pm_card_visa", {
      customer: newCustomer.id,
    });

    // 3. Set the default payment method
    await stripe.customers.update(newCustomer.id, {
      invoice_settings: {
        default_payment_method: payment.id,
      },
    });
    return res.json(createResponsePayload(newCustomer));
  } catch (error) {
    console.error("Error in customer creation/fetch:", error.message);
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const { customerId, priceId } = req.body;
    console.log(
      "Creating subscription for customer:",
      customerId,
      "with price:",
      priceId
    );
    // Create a Checkout session for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      expand: ["latest_invoice.payment_intent"],
      items: [{ price: priceId }],
    });
    console.log("Subscription created:", subscription);
    return res.json(createResponsePayload({ id: subscription.id }));
  } catch (error) {
    next(error);
  }
};

export const checkPaymentStatus = async (req, res, next) => {
  try {
    // Retrieve the payment status of subscription.
    console.log("Checking payment status for subscription:", req.params);
    const { sessionId } = req.params;
    const subscriptionId = sessionId; // Assuming sessionId is passed as a parameter
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const paymentStatus = subscription.status;
    console.log(
      "Payment status for subscription:",
      subscriptionId,
      "is",
      paymentStatus
    );
    // Prod code
    // const session = await stripe.checkout.sessions.retrieve(
    //   req.params.sessionId

    //);
    // Check the payment status
    // const paymentStatus = session.payment_status;

    if (paymentStatus === "active") {
      return res.json(createResponsePayload({ paymentStatus: "paid" }));
    } else if (paymentStatus === "unpaid") {
      return res.json(createResponsePayload({ paymentStatus: "unpaid" }));
    } else {
      return res.json(createResponsePayload({ paymentStatus: "unknown" }));
    }
  } catch (error) {
    next(error);
  }
};

// export const getCustomerPaymentInfo = async (req, res, next) => {
//   try {
//     // Fetch customer details
//     const customer = await stripe.customers.retrieve(req.params.customerId)

//     // Fetch subscriptions for this customer
//     const subscriptions = await stripe.subscriptions.list({
//       customer: req.params.customerId,
//       limit: 1, // Get the latest subscription (if the customer has more than one)
//     })

//     console.log({subscriptions: subscriptions.data[0]})

//     if (subscriptions.data.length > 0) {
//       const subscription = subscriptions.data[0]
//       // Subscription start and end dates
//       const subscriptionStartDate = new Date(subscription.created * 1000) // Convert timestamp to Date
//       const subscriptionEndDate = new Date(
//         subscription.current_period_end * 1000,
//       ) // Convert timestamp to Date

//       return res.json(
//         createResponsePayload({
//           subscriptions,
//           // subscriptionStartDate: subscriptionStartDate,
//           // subscriptionEndDate: subscriptionEndDate,
//           // status: subscription.status,
//           // plan: subscription.items.data[0].price.nickname, // Assuming you're saving plan names with prices
//         }),
//       )
//     }
//     return res.json(
//       createResponsePayload({
//         message: 'subscription not found',
//       }),
//     )
//   } catch (error) {
//     console.error('Error fetching payment info:', error)
//     // throw new Error('Failed to retrieve customer payment info.')
//     next(error)
//   }
// }

// export const getCustomerPaymentInfo = async (req, res, next) => {
//   try {
//     // Fetch customer details
//     const customer = await stripe.customers.retrieve(req.params.customerId)

//     // Fetch subscriptions for this customer
//     const subscriptions = await stripe.subscriptions.list({
//       customer: req.params.customerId,
//       limit: 1, // Get the latest subscription (if the customer has more than one)
//     })

//     // Log the subscription details to check if they exist
//     console.log({subscriptions: subscriptions.data[0]})

//     if (subscriptions.data.length > 0) {
//       const subscription = subscriptions.data[0]
//       // Subscription start and end dates
//       const subscriptionStartDate = new Date(subscription.created * 1000) // Convert timestamp to Date
//       const subscriptionEndDate = new Date(
//         subscription.current_period_end * 1000,
//       ) // Convert timestamp to Date

//       return res.json(
//         createResponsePayload({
//           subscriptions,
//           subscriptionStartDate,
//           subscriptionEndDate,
//           status: subscription.status,
//           plan: subscription.items.data[0].price.nickname, // Assuming you're saving plan names with prices
//         }),
//       )
//     }

//     // If no subscriptions found, check for one-time payments using PaymentIntents
//     const paymentIntents = await stripe.paymentIntents.list({
//       customer: req.params.customerId,
//       limit: 5, // Limit to the latest 5 payments
//     })

//     if (paymentIntents.data.length > 0) {
//       const paymentDetails = paymentIntents.data.map(intent => ({
//         amount: intent.amount_received / 100, // Amount in your currency, divided by 100 (since it's in cents)
//         status: intent.status,
//         created: new Date(intent.created * 1000), // Convert timestamp to Date
//         paymentMethod: intent.payment_method_types.join(', '), // Payment methods used
//       }))

//       return res.json(
//         createResponsePayload({
//           message: 'One-time payments found.',
//           paymentDetails,
//         }),
//       )
//     }

//     // If no payments or subscriptions found, send a response indicating so
//     return res.json(
//       createResponsePayload({
//         message: 'No active subscriptions or one-time payments found.',
//       }),
//     )
//   } catch (error) {
//     console.error('Error fetching payment info:', error)
//     next(error) // Pass the error to the error-handling middleware
//   }
// }

export const getCustomerPaymentInfo = async (req, res, next) => {
  try {
    // Fetch customer details
    const customer = await stripe.customers.retrieve(req.params.customerId);

    // Fetch subscriptions for this customer
    // const subscriptions = await stripe.subscriptions.list({
    //   customer: req.params.customerId,
    //   limit: 1, // Get the latest subscription (if the customer has more than one)
    // })

    // console.log({subscriptions: subscriptions.data[0]})

    // // Check if the customer has an active subscription
    // if (subscriptions.data.length > 0) {
    //   const subscription = subscriptions.data[0]
    //   // Subscription start and end dates
    //   const subscriptionStartDate = new Date(subscription.created * 1000) // Convert timestamp to Date
    //   const subscriptionEndDate = new Date(
    //     subscription.current_period_end * 1000,
    //   ) // Convert timestamp to Date

    //   return res.json(
    //     createResponsePayload({
    //       subscriptions,
    //       subscriptionStartDate,
    //       subscriptionEndDate,
    //       status: subscription.status,
    //       plan: subscription.items.data[0].price.nickname, // Assuming you're saving plan names with prices
    //     }),
    //   )
    // }

    // If no active subscriptions found, check for one-time payments using PaymentIntents
    const paymentIntents = await stripe.paymentIntents.list({
      customer: req.params.customerId,
      limit: 5, // Limit to the latest 5 payments
    });

    // If one-time payments (PaymentIntents) are found
    if (paymentIntents.data.length > 0) {
      const paymentDetails = paymentIntents.data.map((intent) => ({
        amount: intent.amount_received / 100, // Amount in your currency, divided by 100 (since it's in cents)
        status: intent.status,
        created: new Date(intent.created * 1000), // Convert timestamp to Date
        paymentMethod: intent.payment_method_types.join(", "), // Payment methods used
      }));

      return res.json(
        createResponsePayload({
          message: "One-time payments found.",
          paymentDetails,
        })
      );
    }

    // If no subscriptions or one-time payments found, send a response indicating so
    return res.json(
      createResponsePayload({
        message: "No active subscriptions or one-time payments found.",
      })
    );
  } catch (error) {
    console.error("Error fetching payment info:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

// Need a new webhook to handle Stripe events
// Using create subscrition instead of checkout sessions

export const testStripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("Received webhook event")
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_KEY);
    console.log(">")
    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const emailId =
          subscription.customer_email || subscription.customer_details.email;
        const subscriptionId = subscription.id;
        const paymentIntentId = subscription.latest_invoice.payment_intent;
        if (!subscriptionId) {
          const subscription = subscriptionId
            ? await stripe.subscriptions.retrieve(subscriptionId)
            : {};
          // Extract payment info and other details
          const paymentMethod =
            subscription.default_payment_method || "unknown"; // Default to 'unknown' if no payment method is set
          const amount = 9; // Convert from cents to dollars
          const subscriptionStartDate = "Not Available"; // Convert from timestamp to ISO string
          const subscriptionEndDate = "Not Available"; // Convert from timestamp to ISO string
          // You can emit a WebSocket event or save this in DB
          const paymentData = {
            paymentId: `payment_${subscriptionId}`, // Use session ID for unique payment ID
            plan: "MONTHLY",
            amount,
            subscriptionStartDate,
            subscriptionEndDate,
            paymentStatus: "completed",
            paymentMethod,
            paymentIntentId,
          };
          console.log("dataBase")
          await addOrUpdatePaymentPlan({
            emailId,
            data: {
              paymentInfo: paymentData,
              stripeCustomerId: customerId,
              customerId,
            },
          });
        }
        break;

      case "invoice.paid": {
        const invoice = event.data.object;
        console.log(`Invoice paid for customer: ${invoice.customer}`);
        const customerId = invoice.customer;
        const emailId = invoice.customer_email || invoice.customer_details.email;
        const subscriptionId = invoice.subscription;
        const paymentIntentId = invoice.payment_intent;
        if (!subscriptionId) {
          const subscription = subscriptionId
            ? await stripe.subscriptions.retrieve(subscriptionId)
            : {};
          // Extract payment info and other details
          const paymentMethod = invoice.default_payment_method || "unknown"; // Default to 'unknown' if no payment method is set         
          const amount = 9; // Convert from cents to dollars
          const subscriptionStartDate = "Not Available"; // Convert from timestamp to ISO string
          const subscriptionEndDate = "Not Available"; // Convert from timestamp to ISO string
          // You can emit a WebSocket event or save this in DB
          const paymentData = {
            paymentId: `payment_${subscriptionId}`, // Use session ID for unique payment ID
            plan: "MONTHLY",
            amount,
            subscriptionStartDate,
            subscriptionEndDate,
            paymentStatus: "completed",
            paymentMethod,
            paymentIntentId,
          };

          await addOrUpdatePaymentPlan({
            emailId,
            data: {
              paymentInfo: paymentData,
              stripeCustomerId: customerId,
              customerId,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        console.log(`Payment failed for customer: ${failedInvoice.customer}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send("Event received");
  } catch (err) {
    console.error("Error processing  event:", err);
    res.status(400).send(` error: ${err.message}`);
  }
};

export const stripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the event signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE__SECRET_KEY
    );

    // Handle the event

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Here we will update the user's subscription status
        const customerId = session.customer;
        const emailId = session.customer_details.email;
        const subscriptionId = session.subscription;
        const paymentIntentId = session.payment_intent;
        if (!subscriptionId) {
          const subscription = subscriptionId
            ? await stripe.subscriptions.retrieve(subscriptionId)
            : {};
          // Extract payment info and other details
          const paymentMethod = session.payment_method_types[0]; // e.g., "card", "paypal"
          const amount = session.amount_total / 100; // Convert from cents to dollars
          const subscriptionStartDate = dayjs
            .unix(session.created)
            .toISOString(); // Convert from timestamp to ISO string
          const subscriptionEndDate = subscriptionId
            ? dayjs.unix(subscription.current_period_end).toISOString()
            : null;

          const paymentData = {
            paymentId: `payment_${session.id}`, // Use session ID for unique payment ID
            plan: session.mode === "payment" ? "ONE_TIME" : "MONTHLY",
            amount,
            subscriptionStartDate,
            subscriptionEndDate,
            paymentStatus: "completed",
            paymentMethod,
            paymentIntentId,
          };

          await addOrUpdatePaymentPlan({
            emailId,
            data: {
              paymentInfo: paymentData,
              stripeCustomerId: customerId,
              customerId,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // writeJSONToFile("test.json", event)
        const session = event.data.object;
        // Here we will update the user's subscription status
        const customerId = session.customer;
        const emailId = session.customer_email;
        const subscriptionId = session.subscription;
        const paymentIntentId = session.payment_intent;
        const subscription = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : {};
        // Extract payment info and other details
        const amount = session.total / 100; // Convert from cents to dollars
        const subscriptionStartDate = dayjs.unix(session.created).toISOString(); // Convert from timestamp to ISO string
        const subscriptionEndDate = subscriptionId
          ? dayjs.unix(subscription.current_period_end).toISOString()
          : null;

        const paymentData = {
          paymentId: `payment_${session.id}`, // Use session ID for unique payment ID
          plan: session.mode === "payment" ? "ONE_TIME" : "MONTHLY",
          amount,
          subscriptionStartDate,
          subscriptionEndDate,
          paymentStatus: "completed",
          paymentIntentId,
        };

        await addOrUpdatePaymentPlan({
          emailId,
          data: {
            paymentInfo: paymentData,
            stripeCustomerId: customerId,
          },
        });
        break;
      }

      // FIXME: Fix the failed case data like plan type etc
      case "invoice.payment_failed": {
        const failedInvoice = event.data.object;
        const failedCustomerId = failedInvoice.customer;
        const emailId = failedInvoice.customer_email;

        // Extract the payment info for failed payment with safe checks
        const paymentMethod =
          failedInvoice.payment_method_types &&
          failedInvoice.payment_method_types.length > 0
            ? failedInvoice.payment_method_types[0] // e.g., "card", "paypal"
            : "unknown"; // Default to 'unknown' if payment_method_types is not present or empty

        const amountDue = failedInvoice.amount_due / 100; // Convert from cents to dollars
        const paymentIntentId = failedInvoice.payment_intent;
        const paymentStatus = failedInvoice.paid ? "completed" : "failed";
        const subscriptionStartDate = dayjs
          .unix(failedInvoice.created)
          .toISOString();
        const subscriptionEndDate = dayjs
          .unix(failedInvoice.period_end)
          .toISOString();

        // Create payment data object for the failed invoice
        const paymentData = {
          paymentId: `payment_${failedInvoice.id}`, // Use invoice ID for unique payment ID
          plan: "monthly",
          amount: amountDue,
          subscriptionStartDate,
          subscriptionEndDate,
          paymentStatus,
          paymentMethod,
          paymentIntentId, // Add Payment Intent ID to track the payment attempt
        };
        await addOrUpdatePaymentPlan({
          emailId,
          data: {
            paymentInfo: paymentData,
            stripeCustomerId: failedCustomerId,
          },
        });
        break;
      }
      default:
        // Handle other event types if necessary
        break;
    }

    res.status(200).send("Event received");
  } catch (err) {
    console.error("Error processing  event:", err);
    res.status(400).send(` error: ${err.message}`);
  }
};

export const verifySubscription = async (req, res, next) => {
  try {
    const { email } = req.user;

    const paymentInfo = await getRecordByIdFromCollection(
      FIREBASE_COLLECTION.PAYMENTS,
      email
    ); // Replace with your DB query

    // Fetch the customer’s subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: paymentInfo?.stripeCustomerId,
      status: "all", // You can also filter by 'active', 'canceled', etc.
      limit: 1,
    });

    // If the user has no subscription, they haven't paid
    if (subscriptions.data.length === 0) {
      throw new Error("No subscription found for this user.");
    }

    const subscription = subscriptions.data[0];

    // Check if the subscription is still active
    const currentDate = new Date();
    const expirationDate = new Date(subscription.current_period_end * 1000); // Convert from Unix timestamp

    if (expirationDate > currentDate && subscription.status === "active") {
      return res.json(createResponsePayload({ isActiveSubscription: true }));
    }

    return res.json(createResponsePayload({ isActiveSubscription: false }));
  } catch (error) {
    next(error);
  }
};
