// yazio-export.js
import { Yazio } from "yazio";
import fetch from "node-fetch";
import { subDays, format } from "date-fns";

const email = process.env.YAZIO_EMAIL;
const password = process.env.YAZIO_PASSWORD;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

const client = new Yazio({
  credentials: {
    username: email,
    password: password,
  },
});

async function main() {
  try {
    // Datum für "gestern" berechnen im Format "YYYY-MM-DD"
    const yesterday = subDays(new Date(), 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    const items = await client.user.getDailySummary({
      date: new Date("2025-08-27"),
    });

    // an n8n Webhook schicken
    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });

    if (!res.ok) {
      throw new Error(
        `Webhook fehlgeschlagen: ${res.status} ${res.statusText}`
      );
    }

    console.log("✅ Yazio-Daten erfolgreich an n8n geschickt");
  } catch (err) {
    console.error("❌ Fehler beim Yazio-Export:", err);
    process.exit(1);
  }
}

main();
