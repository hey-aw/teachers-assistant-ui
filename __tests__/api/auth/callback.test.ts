import { NextApiRequest, NextApiResponse } from 'next';
import { sendCommand } from '@/lib/chatApi';
import handler from '@/app/api/auth/callback';

jest.mock('@/lib/chatApi', () => ({
  sendCommand: jest.fn(),
}));

describe('Callback Route', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    req = {
      method: 'GET',
      query: {
        code: 'test-code',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should handle successful authorization', async () => {
    (sendCommand as jest.Mock).mockResolvedValue({ success: true });

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(sendCommand).toHaveBeenCalledWith({ resume: 'yes' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should handle failed authorization', async () => {
    (sendCommand as jest.Mock).mockResolvedValue({ success: false });

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(sendCommand).toHaveBeenCalledWith({ resume: 'no' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false });
  });

  it('should handle missing code parameter', async () => {
    req.query = {};

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing code parameter' });
  });

  it('should handle unexpected errors', async () => {
    (sendCommand as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
  });
});
