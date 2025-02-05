module.exports = {
  useLangGraphRuntime: jest.fn().mockReturnValue({
    messages: [],
    isStreaming: false,
    isError: false,
    error: null,
    sendMessage: jest.fn(),
    switchToNewThread: jest.fn(),
    switchToThread: jest.fn(),
    clearThread: jest.fn(),
    interrupt: null,
  }),
  useLangGraphInterruptState: jest.fn().mockReturnValue(null),
  useLangGraphSendCommand: jest.fn(),
  LangChainMessage: jest.fn(),
}; 