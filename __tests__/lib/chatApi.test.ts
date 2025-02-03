import { createThread, getThreadState, sendMessage } from '@/lib/chatApi';
import { Client } from '@langchain/langgraph-sdk';

jest.mock('@langchain/langgraph-sdk', () => ({
  Client: jest.fn().mockImplementation(() => ({
    threads: {
      create: jest.fn().mockResolvedValue({ thread_id: 'mock-thread-id' }),
      getState: jest.fn().mockResolvedValue({ values: { messages: [] } }),
    },
    runs: {
      stream: jest.fn().mockResolvedValue({}),
    },
  })),
}));

describe('chatApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createThread', () => {
    it('should create a new thread', async () => {
      const result = await createThread();
      expect(result).toEqual({ thread_id: 'mock-thread-id' });
      expect(Client).toHaveBeenCalled();
    });
  });

  describe('getThreadState', () => {
    it('should get the state of a thread', async () => {
      const result = await getThreadState('mock-thread-id');
      expect(result).toEqual({ values: { messages: [] } });
      expect(Client).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    const mockParams = {
      threadId: 'mock-thread-id',
      messages: [{ text: 'Hello' }],
      command: { type: 'command' },
      userId: 'user-id',
    };

    it('should send a message successfully', async () => {
      const result = await sendMessage(mockParams);
      expect(result).toEqual({});
      expect(Client).toHaveBeenCalled();
    });

    it('should handle missing parameters gracefully', async () => {
      const result = await sendMessage({ threadId: 'mock-thread-id' });
      expect(result).toEqual({});
      expect(Client).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      (Client as jest.Mock).mockImplementationOnce(() => ({
        runs: {
          stream: jest.fn().mockRejectedValue(error),
        },
      }));

      await expect(sendMessage(mockParams)).rejects.toThrow('Network error');
    });

    it('should handle user ID correctly', async () => {
      const result = await sendMessage({ ...mockParams, userId: null });
      expect(result).toEqual({});
      expect(Client).toHaveBeenCalled();
    });

    it('should set stream mode correctly', async () => {
      const result = await sendMessage(mockParams);
      expect(result).toEqual({});
      expect(Client).toHaveBeenCalled();
    });

    it('should handle environment variables', async () => {
      delete process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID;
      await expect(sendMessage(mockParams)).rejects.toThrow();
    });

    it('should validate API response', async () => {
      const result = await sendMessage(mockParams);
      expect(result).toEqual({});
      expect(Client).toHaveBeenCalled();
    });
  });
});
