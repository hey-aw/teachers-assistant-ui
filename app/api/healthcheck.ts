import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const healthCheck = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check external API availability
    const apiResponse = await fetch('https://api.example.com/health');
    if (!apiResponse.ok) {
      throw new Error('External API is not available');
    }

    // Simulate a health check by returning a success status
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
};

export default healthCheck;
