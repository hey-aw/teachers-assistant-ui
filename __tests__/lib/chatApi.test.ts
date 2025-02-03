import { createThread, getThreadState, sendMessage } from '@/lib/chatApi';
import { Client } from '@langchain/langgraph-sdk';
import { LangChainMessage, LangGraphCommand } from '@assistant-ui/react-langgraph';

// Create a mock client instance that we'll use throughout the tests
const mockClient = {
  threads: {
    create: jest.fn().mockResolvedValue({ thread_id: 'mock-thread-id' }),
    getState: jest.fn().mockResolvedValue({ values: { messages: [] } }),
  },
  runs: {
    stream: jest.fn().mockResolvedValue({}),
  },
};

// Mock the Client constructor to return our mockClient
jest.mock('@langchain/langgraph-sdk', () => ({
  Client: jest.fn().mockImplementation(() => mockClient),
}));

describe('chatApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createThread', () => {
    it('should create a new thread', async () => {
      const result = await createThread();
      expect(mockClient.threads.create).toHaveBeenCalled();
      expect(result).toEqual({ thread_id: 'mock-thread-id' });
    });
  });

  describe('getThreadState', () => {
    it('should get the state of a thread', async () => {
      const threadId = 'mock-thread-id';
      const result = await getThreadState(threadId);
      expect(mockClient.threads.getState).toHaveBeenCalledWith(threadId);
      expect(result).toEqual({ values: { messages: [] } });
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID = 'mock-assistant-id';
      const params = {
        threadId: 'mock-thread-id',
        messages: [{ type: 'human', content: 'Hello' }] as LangChainMessage[],
        command: { type: 'command', resume: 'true' } as LangGraphCommand,
      };
      const result = await sendMessage(params);
      expect(mockClient.runs.stream).toHaveBeenCalledWith(
        params.threadId,
        'mock-assistant-id',
        {
          input: { messages: params.messages },
          command: params.command,
          config: {
            configurable: {
              model_name: 'openai',
            },
          },
          streamMode: ['updates', 'messages'],
        }
      );
      expect(result).toEqual({});
    });
  });
});
