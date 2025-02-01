import { handleChatMessage, resumeAfterAuth } from '../../lib/chatApi'
import fetchMock from 'jest-fetch-mock'

// Configure fetch mock
beforeAll(() => {
  fetchMock.enableMocks()
})

beforeEach(() => {
  fetchMock.resetMocks()
})

describe('handleChatMessage', () => {
  it('handles normal chat responses', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      content: 'Hello there!'
    }))

    const result = await handleChatMessage('Hi')
    expect(result).toEqual({
      type: 'response',
      content: 'Hello there!'
    })
  })

  it('handles OAuth interrupts', async () => {
    const mockInterrupt = {
      value: 'Please authorize: https://accounts.google.com/oauth...',
      resumable: false,
      ns: null,
      when: 'during'
    }

    fetchMock.mockResponseOnce(JSON.stringify({
      __interrupt__: mockInterrupt
    }))

    const result = await handleChatMessage('Check my email')
    expect(result).toEqual({
      type: 'interrupt',
      interrupt: mockInterrupt
    })
  })
})

describe('resumeAfterAuth', () => {
  it('resumes chat after authorization', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      content: 'Now I can access your emails!'
    }))

    const result = await resumeAfterAuth(
      'thread-123',
      'auth-code-456'
    )

    expect(result).toEqual({
      type: 'response',
      content: 'Now I can access your emails!'
    })
  })
})
