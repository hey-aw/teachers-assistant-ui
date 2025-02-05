import { NextRequest, NextResponse } from "next/server"

export class MockNextRequest implements NextRequest {
    url: string
    headers: Headers
    cookies: Map<string, string>
    nextUrl: URL
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
    page = { name: 'test', params: {} }
    ua = { isBot: false }
    geo = { city: '', country: '', region: '', latitude: '', longitude: '' }
    ip = ''
    [Symbol.for('edge-headers')]: Headers = new Headers()

    constructor(url?: string) {
        this.url = url || 'http://localhost:3000'
        this.nextUrl = new URL(this.url)
        this.headers = new Headers()
        this.cookies = new Map()
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
        return Promise.resolve(new Blob([]))
    }

    clone(): NextRequest {
        return this
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
    cookies: Map<string, { value: string; options?: any }>

    constructor() {
        super()
        this.cookies = new Map()
    }

    json(data: any) {
        return NextResponse.json(data)
    }

    redirect(url: string) {
        return NextResponse.redirect(url)
    }
} 