import { NextApiRequest, NextApiResponse } from 'next';

const healthCheck = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
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
