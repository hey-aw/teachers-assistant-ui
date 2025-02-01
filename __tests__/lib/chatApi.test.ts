import { authorize } from '@/lib/chatApi';
import { tool_manager } from '@/lib/toolManager';

jest.mock('@/lib/toolManager', () => ({
  tool_manager: {
    requires_auth: jest.fn(),
    authorize: jest.fn(),
    wait_for_auth: jest.fn(),
    is_authorized: jest.fn(),
  },
}));

describe('authorize', () => {
  const mockState = {
    messages: [
      {
        tool_calls: [
          { name: 'tool1' },
          { name: 'tool2' },
        ],
      },
    ],
  };

  const mockConfig = {
    configurable: new Map([['user_id', 'test_user_id']]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle tools that do not require authorization', async () => {
    tool_manager.requires_auth.mockReturnValue(false);

    const result = await authorize(mockState, mockConfig);

    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool1');
    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool2');
    expect(tool_manager.authorize).not.toHaveBeenCalled();
    expect(result).toEqual({ messages: [] });
  });

  it('should handle tools that require authorization', async () => {
    tool_manager.requires_auth.mockReturnValue(true);
    tool_manager.authorize.mockReturnValue({ status: 'completed' });

    const result = await authorize(mockState, mockConfig);

    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool1');
    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool2');
    expect(tool_manager.authorize).toHaveBeenCalledWith('tool1', 'test_user_id');
    expect(tool_manager.authorize).toHaveBeenCalledWith('tool2', 'test_user_id');
    expect(result).toEqual({ messages: [] });
  });

  it('should prompt user for authorization if not completed', async () => {
    tool_manager.requires_auth.mockReturnValue(true);
    tool_manager.authorize.mockReturnValue({ status: 'pending', url: 'http://auth.url', id: 'auth_id' });
    tool_manager.is_authorized.mockReturnValue(true);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = await authorize(mockState, mockConfig);

    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool1');
    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool2');
    expect(tool_manager.authorize).toHaveBeenCalledWith('tool1', 'test_user_id');
    expect(tool_manager.authorize).toHaveBeenCalledWith('tool2', 'test_user_id');
    expect(consoleSpy).toHaveBeenCalledWith('Visit the following URL to authorize: http://auth.url');
    expect(tool_manager.wait_for_auth).toHaveBeenCalledWith('auth_id');
    expect(tool_manager.is_authorized).toHaveBeenCalledWith('auth_id');
    expect(result).toEqual({ messages: [] });

    consoleSpy.mockRestore();
  });

  it('should throw an error if authorization fails', async () => {
    tool_manager.requires_auth.mockReturnValue(true);
    tool_manager.authorize.mockReturnValue({ status: 'pending', url: 'http://auth.url', id: 'auth_id' });
    tool_manager.is_authorized.mockReturnValue(false);

    await expect(authorize(mockState, mockConfig)).rejects.toThrow('Authorization failed');

    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool1');
    expect(tool_manager.requires_auth).toHaveBeenCalledWith('tool2');
    expect(tool_manager.authorize).toHaveBeenCalledWith('tool1', 'test_user_id');
    expect(tool_manager.authorize).toHaveBeenCalledWith('tool2', 'test_user_id');
    expect(tool_manager.wait_for_auth).toHaveBeenCalledWith('auth_id');
    expect(tool_manager.is_authorized).toHaveBeenCalledWith('auth_id');
  });
});
