import { getMockUser, getAllMockUsers } from '@/lib/mockAuth';

describe('Mock Auth Service', () => {
    describe('getMockUser', () => {
        it('should return user for valid email', () => {
            const user = getMockUser('aw@eddolearning.com');
            expect(user).toEqual({
                email: 'aw@eddolearning.com',
                email_verified: true,
                name: 'AW'
            });
        });

        it('should return undefined for invalid email', () => {
            const user = getMockUser('invalid@email.com');
            expect(user).toBeUndefined();
        });
    });

    describe('getAllMockUsers', () => {
        it('should return all mock users', () => {
            const users = getAllMockUsers();
            expect(users).toHaveLength(2);
            expect(users).toEqual([
                {
                    email: 'aw@eddolearning.com',
                    email_verified: true,
                    name: 'AW'
                },
                {
                    email: 'joel@eddolearning.com',
                    email_verified: true,
                    name: 'Joel'
                }
            ]);
        });
    });
}); 