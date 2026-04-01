import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔒 USE CHAVE DE TESTE (sk_test_)
const stripe = new Stripe("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");

app.post("/create-checkout", async (req, res) => {
  const { amount, type, hours } = req.body;

  // 🔍 validação básica
  if (!amount || amount < 5 || amount > 500) {
    return res.status(400).json({ error: "Valor inválido ($5 - $500)" });
  }

  try {
    let productName = "Lion Notifier Balance";

    if (type === "plan") {
      productName = `Lion Notifier Plan (${hours}h)`;
    }

    // 💵 converter dólar → centavos (Stripe exige isso)
    const amountInCents = Math.round(Number(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      // 🔥 IMPORTANTE (para atualizar saldo depois)
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

// rota teste
app.get("/", (req, res) => {
  res.send("Server online 🚀");
});

// porta do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server rodando na porta " + PORT));
// redeploy
