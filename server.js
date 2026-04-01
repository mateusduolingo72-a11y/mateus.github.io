import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔒 USE TESTE PRA NÃO COBRAR DINHEIRO REAL
const stripe = new Stripe("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");

app.post("/create-checkout", async (req, res) => {
  const { amount, type, hours } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    let productName = "Lion Notifier Balance";

    if (type === "plan") {
      productName = `Plan Purchase (${hours}h)`;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      success_url:
        "https://mateusduolingo72-a11y.github.io/mateus.github.io/?success=true",

      cancel_url:
        "https://mateusduolingo72-a11y.github.io/mateus.github.io/",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Erro no pagamento" });
  }
});

app.get("/", (req, res) => {
  res.send("Server online 🚀");
});

app.listen(3000, () => console.log("Server rodando"));
