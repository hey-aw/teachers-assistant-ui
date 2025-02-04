export type MockUser = {
    email: string;
    email_verified: boolean;
    name: string;
};

const MOCK_USERS: MockUser[] = [
    {
        email: "aw@eddolearning.com",
        email_verified: true,
        name: "AW"
    },
    {
        email: "joel@eddolearning.com",
        email_verified: true,
        name: "Joel"
    }
];

export const getMockUser = (email: string) => {
    return MOCK_USERS.find(user => user.email === email);
};

export const getAllMockUsers = () => {
    return MOCK_USERS;
}; 