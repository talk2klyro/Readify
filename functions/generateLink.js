import { put, getSignedUrl } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { file } = req.body;
  try {
    // Generate temporary signed URL for download
    const url = await getSignedUrl(file, { expiresIn: "1h" });
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate link" });
  }
}
