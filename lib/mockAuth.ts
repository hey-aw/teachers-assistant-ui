interface MockUser {
    name: string;
    email: string;
    emailVerified: boolean;
    picture?: string;
}

const mockUsers: MockUser[] = [
    {
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        picture: 'https://example.com/avatar.jpg'
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        emailVerified: true
    }
];

export function getAllMockUsers(): MockUser[] {
    return mockUsers;
}

export function getMockUser(email: string): MockUser | undefined {
    return mockUsers.find(user => user.email === email);
}

export function createMockUser(userData: Partial<MockUser>): MockUser {
    return {
        name: userData.name || 'Test User',
        email: userData.email || 'test@example.com',
        emailVerified: userData.emailVerified ?? true,
        picture: userData.picture
    };
} 