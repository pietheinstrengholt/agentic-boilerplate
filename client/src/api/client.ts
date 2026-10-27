import createClient from 'openapi-fetch'
import type { paths } from './generated'

// Share generated API contracts across sign-in and session restoration.
export const api = createClient<paths>({ baseUrl: '' })
