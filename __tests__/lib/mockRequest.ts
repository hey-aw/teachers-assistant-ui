import { NextRequest, NextResponse } from "next/server"
import { RequestCookies, ResponseCookies } from 'next/dist/server/web/spec-extension/cookies'

export class MockNextRequest implements Partial<NextRequest> {
    url: string
    headers: Headers
    cookies: RequestCookies
    nextUrl: any // NextURL is internal, using any for test purposes
    method: string = 'GET'
    cache: RequestCache = 'default'
    credentials: RequestCredentials = 'same-origin'
    destination: RequestDestination = ''
    integrity: string = ''
    keepalive: boolean = false
    mode: RequestMode = 'cors'
    redirect: RequestRedirect = 'follow'
    referrer: string = ''
    referrerPolicy: ReferrerPolicy = 'no-referrer'
    signal: AbortSignal = new AbortController().signal
    body: ReadableStream | null = null
    bodyUsed: boolean = false
    page?: void
    ua?: void
    geo = { city: '', country: '', region: '', latitude: '', longitude: '' }
    ip = ''
    private edgeHeaders: Headers = new Headers()

    constructor(url?: string) {
        this.url = url || 'http://localhost:3000'
        this.nextUrl = new URL(this.url) // Using URL instead of NextURL for tests
        this.headers = new Headers()
        this.cookies = new RequestCookies(this.headers)
    }

    get [Symbol.for('edge-headers')](): Headers {
        return this.edgeHeaders
    }

    set [Symbol.for('edge-headers')](value: Headers) {
        this.edgeHeaders = value
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

    // Required NextRequest methods
    arrayBuffer(): Promise<ArrayBuffer> {
        return Promise.resolve(new ArrayBuffer(0))
    }

    blob(): Promise<Blob> {
        return Promise.resolve(new Blob())
    }

    clone(): NextRequest {
        return this as unknown as NextRequest
    }

    formData(): Promise<FormData> {
        return Promise.resolve(new FormData())
    }

    json(): Promise<any> {
        return Promise.resolve({})
    }

    text(): Promise<string> {
        return Promise.resolve('')
    }
}

export class MockNextResponse extends NextResponse {
    private cookiesMap: ResponseCookies

    constructor() {
        super()
        this.cookiesMap = new ResponseCookies(this.headers)
    }

    get cookies(): ResponseCookies {
        return this.cookiesMap
    }

    json(): Promise<any> {
        return Promise.resolve({})
    }

    redirect(url: string): NextResponse {
        return NextResponse.redirect(url)
    }
}

describe('MockNextRequest', () => {
    it('should create a mock request with default values', () => {
        const request = new MockNextRequest()
        expect(request.url).toBe('http://localhost:3000')
        expect(request.method).toBe('GET')
    })
}) 