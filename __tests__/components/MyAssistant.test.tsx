import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MyAssistant } from '@/components/MyAssistant';
import { createThread, sendMessage } from '@/lib/chatApi';
import type { LangChainMessage } from '@assistant-ui/react-langgraph';
import React from 'react';
import { useLangGraphRuntime } from '@assistant-ui/react-langgraph';

// Mock all external UI components
jest.mock('@assistant-ui/react', () => ({
    Thread: ({
        runtime,
        components,
        assistantMessage,
    }: {
        runtime: any;
        components?: { MessagesFooter?: React.ComponentType };
        assistantMessage?: { components: Record<string, any> };
    }) => (
        <div role="complementary" data-error={runtime.isError || undefined}>
            <div data-testid="messages">
                {runtime.messages?.map((msg: LangChainMessage) => (
                    <div key={msg.id}>{typeof msg.content === 'string' ? msg.content : 'Complex content'}</div>
                ))}
            </div>
            <input
                role="textbox"
                type="text"
                onChange={() => { }}
                onKeyDown={() => { }}
            />
            {components?.MessagesFooter && <components.MessagesFooter />}
        </div>
    ),
    TextContentPartComponent: jest.fn(),
    CompositeAttachmentAdapter: jest.fn(),
    SimpleImageAttachmentAdapter: jest.fn(),
    SimpleTextAttachmentAdapter: jest.fn(),
}));

// Mock the markdown module
jest.mock('@assistant-ui/react-markdown', () => ({
    makeMarkdownText: () => () => null
}));

// Mock the langgraph module
jest.mock('@assistant-ui/react-langgraph', () => ({
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
}));

// Mock the auth0 hook
jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn().mockReturnValue({ user: null, error: null, isLoading: false }),
}));

// Mock the chat API functions
jest.mock('@/lib/chatApi', () => ({
    createThread: jest.fn(),
    sendMessage: jest.fn(),
    getThreadState: jest.fn(),
}));

describe('MyAssistant', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock implementations
        (createThread as jest.Mock).mockResolvedValue({ thread_id: 'test-thread-id' });
        (sendMessage as jest.Mock).mockImplementation(async function* () {
            // Simulate metadata event
            yield {
                event: 'metadata',
                data: {
                    run_id: 'test-run-id',
                    attempt: 1,
                },
            };

            // Simulate message events
            yield {
                event: 'messages/partial',
                data: [{
                    content: 'Hello',
                    type: 'ai' as const,
                    id: 'test-message-id',
                }],
            };

            yield {
                event: 'messages/partial',
                data: [{
                    content: 'Hello, how can I help?',
                    type: 'ai' as const,
                    id: 'test-message-id',
                    response_metadata: {
                        finish_reason: 'stop',
                        model_name: 'gpt-4',
                    },
                }],
            };

            // Simulate updates event
            yield {
                event: 'updates',
                data: {
                    call_model: {
                        messages: [{
                            content: 'Hello, how can I help?',
                            type: 'ai' as const,
                            id: 'test-message-id',
                        }],
                    },
                },
            };
        });
    });

    it('renders without crashing', () => {
        render(<MyAssistant />);
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).not.toHaveAttribute('data-error');
    });

    it('handles streaming messages correctly', async () => {
        render(<MyAssistant />);

        // Send a test message
        const input = screen.getByRole('textbox') as HTMLInputElement;
        await act(async () => {
            input.focus();
            input.value = 'test message';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });

        // Wait for streaming messages
        await waitFor(() => {
            expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('creates a new thread on first message', async () => {
        render(<MyAssistant />);

        // Send a test message
        const input = screen.getByRole('textbox') as HTMLInputElement;
        await act(async () => {
            input.focus();
            input.value = 'test message';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });

        expect(createThread).toHaveBeenCalled();
    });

    describe('error handling', () => {
        it('shows error state when runtime has error', () => {
            (useLangGraphRuntime as jest.Mock).mockReturnValueOnce({
                messages: [],
                isStreaming: false,
                isError: true,
                error: new Error('Test error'),
                sendMessage: jest.fn(),
                switchToNewThread: jest.fn(),
                switchToThread: jest.fn(),
                clearThread: jest.fn(),
                interrupt: null,
            });

            render(<MyAssistant />);
            expect(screen.getByRole('complementary')).toHaveAttribute('data-error', '');
        });

        it('handles streaming errors gracefully', async () => {
            // Mock an error in streaming
            (sendMessage as jest.Mock).mockImplementation(async function* () {
                throw new Error('Stream error');
            });

            render(<MyAssistant />);

            // Send a test message
            const input = screen.getByRole('textbox') as HTMLInputElement;
            await act(async () => {
                input.focus();
                input.value = 'test message';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            });

            // Verify error handling
            await waitFor(() => {
                expect(screen.getByRole('complementary')).toHaveAttribute('data-error', 'true');
            }, { timeout: 1000 });
        });
    });
}); 