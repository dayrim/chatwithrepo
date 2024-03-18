import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      console.log("Request body:", req.body); // Log the request body

      // Assuming the request body now also includes a customer ID field
      const customerId = req.body.customerId;
      if (!customerId) {
        throw new Error("Customer ID is required.");
      }

      const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookupKey],
        expand: ["data.product"],
      });

      console.log("Stripe Prices:", prices); // Log the prices received from Stripe

      if (prices.data.length === 0) {
        throw new Error("No prices found for the provided lookup_key.");
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId, // Add the customer ID here
        billing_address_collection: "auto",
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.origin}/?successSubscribe=true`,
        cancel_url: `${req.headers.origin}/?canceledSubscribe=true`,
      });
      console.log("Stripe Session:", session); // Log the session details

      res.status(200).json({ url: session.url });
    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
