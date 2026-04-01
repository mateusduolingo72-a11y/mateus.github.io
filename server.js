import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔥 COLOQUE SUA SECRET KEY CORRETA
const stripe = new Stripe("sk_test_SUA_CHAVE_AQUI");

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

      // 🔥 IMPORTANTE
      success_url: "https://mateusduolingo72-a11y.github.io/mateus.github.io/?success=true",
      cancel_url: "https://mateusduolingo72-a11y.github.io/mateus.github.io/",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no pagamento" });
  }
});

app.listen(3000, () => console.log("Server rodando"));
