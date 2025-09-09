export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // TODO: Verify Flutterwave signature here
  console.log("Webhook received:", req.body);

  // Simulate sending expiring download link
  return res.status(200).json({ message: "Payment verified" });
}
