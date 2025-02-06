import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/app/api/auth/callback';
import { sendCommand } from '@/lib/chatApi';

jest.mock('@/lib/chatApi', () => ({
  sendCommand: jest.fn(),
}));

describe('Authorization Callback API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 400 if auth_id is missing', async () => {
    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing auth_id parameter' });
  });

  it('should handle successful authorization', async () => {
    req.query = { auth_id: 'test-auth-id' };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(sendCommand).toHaveBeenCalledWith({ resume: 'yes', auth_id: 'test-auth-id' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization completed successfully' });
  });

  it('should handle internal server error', async () => {
    req.query = { auth_id: 'test-auth-id' };
    (sendCommand as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
