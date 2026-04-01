import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const stripe = new Stripe("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");

app.post("/create-checkout", async (req, res) => {
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lion Notifier Balance",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://mateusduolingo72-a11y.github.io/mateus.github.io/",
      cancel_url: "https://mateusduolingo72-a11y.github.io/mateus.github.io/",
    });

    res.json({ url: session.url });

  } catch (err) {
    res.status(500).json({ error: "Erro no pagamento" });
  }
});

app.listen(3000, () => console.log("Server rodando"));
