import { getMockUser, getAllMockUsers } from '@/lib/mockAuth';
import { NextRequest } from "next/server"
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'

describe('Mock Auth Service', () => {
    describe('getMockUser', () => {
        it('should return user for valid email', () => {
            const user = getMockUser('aw@eddolearning.com');
            expect(user).toMatchObject({
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

export class MockNextRequest implements Pick<NextRequest, 'url' | 'headers' | 'cookies'> {
    url: string
    headers: Headers
    cookies: RequestCookies

    constructor(url?: string) {
        this.url = url || 'http://localhost:3000'
        this.headers = new Headers()
        this.cookies = new RequestCookies(this.headers)
    }

    set(name: string, value: string) {
        this.cookies.set(name, value)
    }

    get(name: string) {
        return this.cookies.get(name)
    }

    delete(name: string) {
        this.cookies.delete(name)
    }
}

export class MockNextResponse {
    status: number
    headers: Headers
    cookies: Map<string, { value: string; options?: any }>

    constructor() {
        this.status = 200
        this.headers = new Headers()
        this.cookies = new Map()
    }

    json(data: any) {
        return { ...this, data }
    }

    redirect(url: string) {
        this.headers.set('Location', url)
        this.status = 302
        return this
    }
} 