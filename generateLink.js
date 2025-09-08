export default async function handler(req, res) {
  const { file } = req.body;
  // Placeholder signed URL logic
  const signedUrl = `/blobs/${file}?expires=${Date.now() + 24*60*60*1000}`;
  res.status(200).json({ url: signedUrl });
}
