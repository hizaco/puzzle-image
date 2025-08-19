// Endpoint serverless (style Vercel). Adapte aux signatures de ton hébergeur si besoin.
import { ImageAnnotatorClient } from '@google-cloud/vision';

type Req = any; // ex: VercelRequest
type Res = any; // ex: VercelResponse

function getVisionClient() {
  const credsJson = process.env.GOOGLE_VISION_CREDENTIALS_JSON;
  if (credsJson) {
    const credentials = JSON.parse(credsJson);
    return new ImageAnnotatorClient({ credentials });
  }
  return new ImageAnnotatorClient();
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { imageUrl } = req.body as { imageUrl: string };
    if (!imageUrl) {
      res.status(400).json({ error: 'imageUrl is required' });
      return;
    }
    const vision = getVisionClient();
    const [result] = await vision.safeSearchDetection(imageUrl);
    const safe = result.safeSearchAnnotation;

    const toBlock = (label?: string) => ['LIKELY', 'VERY_LIKELY'].includes(label || '');

    const output = {
      adult: safe?.adult,
      violence: safe?.violence,
      racy: safe?.racy,
      medical: safe?.medical,
      spoof: safe?.spoof,
      safe: !(toBlock(safe?.adult) || toBlock(safe?.violence) || toBlock(safe?.racy)),
      reason: undefined as string | undefined,
    };
    if (!output.safe) {
      output.reason = 'Contenu potentiellement sensible détecté (SafeSearch).';
    }
    res.status(200).json(output);
  } catch (e: any) {
    console.error('Safe image error', e);
    res.status(500).json({ error: 'SafeSearch failed' });
  }
}
