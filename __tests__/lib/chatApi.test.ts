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
  let clientMock: jest.Mocked<Client>;

  beforeEach(() => {
    jest.clearAllMocks();
    clientMock = new Client() as jest.Mocked<Client>;
  });

  describe('createThread', () => {
    it('should create a new thread', async () => {
      const result = await createThread();
      expect(clientMock.threads.create).toHaveBeenCalled();
      expect(result).toEqual({ thread_id: 'mock-thread-id' });
    });
  });

  describe('getThreadState', () => {
    it('should get the state of a thread', async () => {
      const threadId = 'mock-thread-id';
      const result = await getThreadState(threadId);
      expect(clientMock.threads.getState).toHaveBeenCalledWith(threadId);
      expect(result).toEqual({ values: { messages: [] } });
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const params = {
        threadId: 'mock-thread-id',
        messages: [{ text: 'Hello' }],
        command: { type: 'command' },
        userId: 'mock-user-id',
      };
      const result = await sendMessage(params);
      expect(clientMock.runs.stream).toHaveBeenCalledWith(
        params.threadId,
        process.env['NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID']!,
        {
          input: { messages: params.messages },
          command: params.command,
          streamMode: ['messages', 'updates'],
          config: {
            configurable: {
              user_id: params.userId,
              thread_id: params.threadId,
            },
          },
        }
      );
      expect(result).toEqual({});
    });
  });
});
