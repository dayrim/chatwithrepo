// pages/api/create-portal-session.ts

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const session_id: string = req.body.session_id;
      const checkoutSession =
        await stripe.checkout.sessions.retrieve(session_id);

      const returnUrl = req.headers.origin as string;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer as string,
        return_url: returnUrl,
      });

      res.redirect(303, portalSession.url);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
