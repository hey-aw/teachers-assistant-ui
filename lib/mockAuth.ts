interface MockUser {
    name: string;
    email: string;
    emailVerified: boolean;
    picture?: string;
}

const mockUsers: MockUser[] = [
    {
        name: 'Test User',
        email: 'test@eddolearning.com',
        emailVerified: true,
        picture: 'https://eddolearning.com/wp-content/uploads/2024/08/underwater-photography-of-green-jelly-fish-1059161-scaled-e1724356562521.jpg'
    },
    {
        name: 'Unverified User',
        email: 'unverified@eddolearning.com',
        emailVerified: false,
        picture: ''
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