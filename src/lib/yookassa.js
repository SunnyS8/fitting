import config from "./config";

const YOOKASSA_API = "https://api.yookassa.ru/v3";

function getAuthHeader() {
  const shopId = config.yookassa.shopId;
  const secretKey = config.yookassa.secretKey;
  return "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64");
}

function idempotenceKey() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const yookassa = {
  // Создать платёж → возвращает confirmation_url для редиректа
  async createPayment({ amount, description, metadata }) {
    const body = JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${config.auth.url}/pricing?payment=success`,
      },
      capture: true,
      description,
      metadata,
    });

    const res = await fetch(`${YOOKASSA_API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(),
        "Idempotence-Key": idempotenceKey(),
      },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ЮKassa error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      confirmationUrl: data.confirmation?.confirmation_url,
      status: data.status,
    };
  },

  // Подтвердить платеж (если нужен capture)
  async capturePayment(paymentId) {
    const res = await fetch(`${YOOKASSA_API}/payments/${paymentId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(),
        "Idempotence-Key": idempotenceKey(),
      },
      body: "{}",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ЮKassa capture error (${res.status}): ${err}`);
    }

    return await res.json();
  },

  // Получить информацию о платеже
  async getPayment(paymentId) {
    const res = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
      headers: { "Authorization": getAuthHeader() },
    });

    if (!res.ok) throw new Error(`ЮKassa getPayment error: ${res.status}`);
    return await res.json();
  },
};