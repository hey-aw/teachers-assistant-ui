import { createThread, getThreadState, sendMessage } from '@/lib/chatApi';
import { Client } from '@langchain/langgraph-sdk';

jest.mock('@langchain/langgraph-sdk', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      threads: {
        create: jest.fn(),
        getState: jest.fn(),
      },
      runs: {
        stream: jest.fn(),
      },
    })),
  };
});

describe('chatApi', () => {
  let clientMock: jest.Mocked<Client>;

  beforeEach(() => {
    jest.clearAllMocks();
    clientMock = new Client() as jest.Mocked<Client>;
  });

  describe('createThread', () => {
    it('should create a new thread successfully', async () => {
      clientMock.threads.create.mockResolvedValue({ threadId: 'test-thread' });

      const result = await createThread();

      expect(clientMock.threads.create).toHaveBeenCalled();
      expect(result).toEqual({ threadId: 'test-thread' });
    });

    it('should throw an error if thread creation fails', async () => {
      clientMock.threads.create.mockRejectedValue(new Error('Creation failed'));

      await expect(createThread()).rejects.toThrow('Failed to create thread');
    });
  });

  describe('getThreadState', () => {
    it('should get the state of a thread successfully', async () => {
      const mockState = { state: 'active' };
      clientMock.threads.getState.mockResolvedValue(mockState);

      const result = await getThreadState('test-thread');

      expect(clientMock.threads.getState).toHaveBeenCalledWith('test-thread');
      expect(result).toEqual(mockState);
    });

    it('should throw an error if getting thread state fails', async () => {
      clientMock.threads.getState.mockRejectedValue(new Error('State retrieval failed'));

      await expect(getThreadState('test-thread')).rejects.toThrow('Failed to get thread state for thread test-thread');
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockStream = { stream: 'test-stream' };
      clientMock.runs.stream.mockResolvedValue(mockStream);

      const result = await sendMessage({
        threadId: 'test-thread',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(clientMock.runs.stream).toHaveBeenCalled();
      expect(result).toEqual(mockStream);
    });

    it('should throw an error if sending message fails', async () => {
      clientMock.runs.stream.mockRejectedValue(new Error('Message sending failed'));

      await expect(sendMessage({
        threadId: 'test-thread',
        messages: [{ role: 'user', content: 'Hello' }],
      })).rejects.toThrow('Failed to send message to thread test-thread');
    });
  });
});
