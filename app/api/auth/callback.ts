import { NextApiRequest, NextApiResponse } from 'next';
import { sendCommand } from '@/lib/chatApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { auth_id } = req.query;

    if (!auth_id) {
      return res.status(400).json({ error: 'Missing auth_id parameter' });
    }

    // Send command to langgraph to resume the conversation
    await sendCommand({ resume: 'yes', auth_id });

    res.status(200).json({ message: 'Authorization completed successfully' });
  } catch (error) {
    console.error('Error handling authorization callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
