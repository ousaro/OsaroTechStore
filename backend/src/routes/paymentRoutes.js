import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';

// import middleware
import requireAuth from "../middleware/requireAuth.js"



dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECTET_KEY);
const router = express.Router();





// Middleware to require authentication for all routes in this router.
router.use(requireAuth);

router.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types : ['card'],
      mode: 'payment',
      line_items : items.map(item => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100, // Stripe expects the price in cents
          },
          quantity: item.quantity,
        }
      }),
      success_url:`${ process.env.CLIENT_URL}/successPayment?session_id={CHECKOUT_SESSION_ID}` ,
      cancel_url: `${ process.env.CLIENT_URL}/Cart`,
     
    });

    res.json({
      url: session.url ,
    });

  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message }); 
  }
})





// Webhook endpoint to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.sendStatus(400);
  }

  res.status(200).json({ received: true });
});


router.get('/session-details/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session details:', error);
    res.status(500).json({ error: 'Failed to retrieve session details' });
  }
});



export default router;
