const YOOKASSA_API = "https://api.yookassa.ru/v3"

function getAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY
  return "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64")
}

function idempotenceKey() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export const yookassa = {
  async createPayment({ amount, description, metadata }: { amount: number; description: string; metadata: Record<string, string> }) {
    const returnUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const body = JSON.stringify({
      amount: { value: amount.toFixed(2), currency: "RUB" },
      confirmation: { type: "redirect", return_url: `${returnUrl}/pricing?payment=success` },
      capture: true,
      description,
      metadata,
    })

    const res = await fetch(`${YOOKASSA_API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
        "Idempotence-Key": idempotenceKey(),
      },
      body,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`ЮKassa error (${res.status}): ${err}`)
    }

    const data = await res.json()
    return {
      id: data.id as string,
      confirmationUrl: data.confirmation?.confirmation_url as string | undefined,
      status: data.status as string,
    }
  },

  async capturePayment(paymentId: string) {
    const res = await fetch(`${YOOKASSA_API}/payments/${paymentId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
        "Idempotence-Key": idempotenceKey(),
      },
      body: "{}",
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`ЮKassa capture error (${res.status}): ${err}`)
    }

    return await res.json()
  },

  async getPayment(paymentId: string) {
    const res = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
      headers: { Authorization: getAuthHeader() },
    })

    if (!res.ok) throw new Error(`ЮKassa getPayment error: ${res.status}`)
    return await res.json()
  },
}
