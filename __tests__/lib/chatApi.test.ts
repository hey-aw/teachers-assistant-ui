import { createThread, getThreadState, sendMessage, createAssistant, updateState, ChatApiError } from '@/lib/chatApi';
import { Client } from '@langchain/langgraph-sdk';
import { LangChainMessage, LangGraphCommand } from '@assistant-ui/react-langgraph';

// Create a mock client instance that we'll use throughout the tests
const mockClient = {
  assistants: {
    create: jest.fn().mockResolvedValue({ assistant_id: 'mock-assistant-id' }),
  },
  threads: {
    create: jest.fn().mockResolvedValue({ thread_id: 'mock-thread-id' }),
    getState: jest.fn().mockResolvedValue({ values: { messages: [] } }),
    updateState: jest.fn().mockResolvedValue({ success: true }),
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
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Reset window.location for each test
    // @ts-ignore
    delete window.location;
    window.location = new URL('https://example.com') as any;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('ChatApiError', () => {
    it('should create error with original error', () => {
      const originalError = new Error('Original error');
      const error = new ChatApiError('Test error', originalError);
      expect(error.message).toBe('Test error');
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('ChatApiError');
    });
  });

  describe('createAssistant', () => {
    it('should create a new assistant', async () => {
      const result = await createAssistant('test-graph');
      expect(mockClient.assistants.create).toHaveBeenCalledWith({ graphId: 'test-graph' });
      expect(result).toEqual({ assistant_id: 'mock-assistant-id' });
    });

    it('should throw ChatApiError on failure', async () => {
      const error = new Error('API Error');
      mockClient.assistants.create.mockRejectedValueOnce(error);
      await expect(createAssistant('test-graph')).rejects.toThrow(ChatApiError);
    });
  });

  describe('createThread', () => {
    it('should create a new thread', async () => {
      const result = await createThread();
      expect(mockClient.threads.create).toHaveBeenCalled();
      expect(result).toEqual({ thread_id: 'mock-thread-id' });
    });

    it('should throw ChatApiError on failure', async () => {
      const error = new Error('API Error');
      mockClient.threads.create.mockRejectedValueOnce(error);
      await expect(createThread()).rejects.toThrow(ChatApiError);
    });
  });

  describe('getThreadState', () => {
    it('should get the state of a thread', async () => {
      const threadId = 'mock-thread-id';
      const result = await getThreadState(threadId);
      expect(mockClient.threads.getState).toHaveBeenCalledWith(threadId);
      expect(result).toEqual({ values: { messages: [] } });
    });

    it('should throw ChatApiError on failure', async () => {
      const error = new Error('API Error');
      mockClient.threads.getState.mockRejectedValueOnce(error);
      await expect(getThreadState('mock-thread-id')).rejects.toThrow(ChatApiError);
    });
  });

  describe('updateState', () => {
    it('should update thread state', async () => {
      const threadId = 'mock-thread-id';
      const fields = {
        newState: { key: 'value' },
        asNode: 'test-node',
      };
      const result = await updateState(threadId, fields);
      expect(mockClient.threads.updateState).toHaveBeenCalledWith(threadId, {
        values: fields.newState,
        asNode: fields.asNode,
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw ChatApiError on failure', async () => {
      const error = new Error('API Error');
      mockClient.threads.updateState.mockRejectedValueOnce(error);
      await expect(updateState('mock-thread-id', { newState: {} })).rejects.toThrow(ChatApiError);
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID = 'mock-assistant-id';
    });

    it('should send a message', async () => {
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
              thread_id: 'mock-thread-id',
              user_id: undefined,
            },
          },
          streamMode: ['updates', 'messages'],
        }
      );
      expect(result).toEqual({});
    });

    it('should handle empty messages array', async () => {
      const params = {
        threadId: 'mock-thread-id',
        messages: [] as LangChainMessage[],
      };
      await sendMessage(params);
      expect(mockClient.runs.stream).toHaveBeenCalledWith(
        params.threadId,
        'mock-assistant-id',
        {
          input: undefined,
          config: {
            configurable: {
              thread_id: 'mock-thread-id',
              user_id: undefined,
            },
          },
          streamMode: ['updates', 'messages'],
        }
      );
    });

    it('should handle API error with response data', async () => {
      const error = new Error('API Error');
      (error as any).response = {
        status: 400,
        data: { message: 'Bad Request' },
      };
      mockClient.runs.stream.mockRejectedValueOnce(error);

      await expect(sendMessage({
        threadId: 'mock-thread-id',
        messages: [],
      })).rejects.toThrow('Failed to send message to thread mock-thread-id (Status 400): {"message":"Bad Request"}');
    });

    it('should handle API error without response data', async () => {
      const error = new Error('API Error');
      mockClient.runs.stream.mockRejectedValueOnce(error);

      await expect(sendMessage({
        threadId: 'mock-thread-id',
        messages: [],
      })).rejects.toThrow('Failed to send message to thread mock-thread-id');
    });
  });
});
