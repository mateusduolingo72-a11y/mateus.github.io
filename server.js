import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "change_this_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false
  }
}));

app.get("/auth/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    scope: "identify email"
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Missing code.");
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error(tokenData);
      return res.status(400).send("Discord token exchange failed.");
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const user = await userRes.json();

    if (!userRes.ok) {
      console.error(user);
      return res.status(400).send("Failed to fetch Discord user.");
    }

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    req.session.user = {
      id: user.id,
      username: user.username,
      global_name: user.global_name || user.username,
      email: user.email || null,
      avatarUrl
    };

    req.session.balance = 9.19;
    req.session.spent = 12.00;
    req.session.plan = {
      active: false,
      name: "No Plan",
      remaining: "0h 0m",
      expiresAt: "--"
    };

    req.session.orders = [
      { id: "txn_demo_001", type: "Balance Deposit", method: "Card / Apple Pay", status: "Confirmed", amount: 5.00 },
      { id: "txn_demo_002", type: "Balance Deposit", method: "Crypto", status: "Confirmed", amount: 18.00 }
    ];

    res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: req.session.user,
    balance: req.session.balance ?? 0,
    spent: req.session.spent ?? 0,
    plan: req.session.plan ?? null,
    orders: req.session.orders ?? []
  });
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.post("/api/pay/card", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required." });
  }

  const { amount } = req.body;
  if (!amount || amount < 5 || amount > 500) {
    return res.status(400).json({ error: "Invalid amount." });
  }

  return res.json({
    ok: true,
    url: "https://buy.stripe.com/test_example"
  });
});

app.post("/api/pay/crypto", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required." });
  }

  return res.json({
    ok: true,
    url: "https://commerce.coinbase.com/checkout/YOUR_CHECKOUT_LINK"
  });
});

app.post("/api/pay/pix", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required." });
  }

  return res.json({
    ok: true,
    url: "https://seu-pagamento-pix-aqui.com"
  });
});

app.post("/api/purchase/plan", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required." });
  }

  const hours = Number(req.body.hours || 1);
  const total = hours * 6;

  return res.json({
    ok: true,
    url: `https://buy.stripe.com/test_example_plan_${total}`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
