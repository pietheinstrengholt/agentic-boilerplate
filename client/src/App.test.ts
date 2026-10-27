// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('./api/client', () => ({
  api: { GET: mockApi.get, POST: mockApi.post },
}))

describe('Wine Journal entry', () => {
  beforeEach(() => {
    mockApi.get.mockReset()
    mockApi.post.mockReset()
    mockApi.get.mockResolvedValue({ data: undefined, response: { status: 401 } })
  })

  it('signs in, welcomes the account, and signs out', async () => {
    // A returning visitor sees the sign-in form until credentials succeed.
    mockApi.post.mockImplementation(async (path: string) =>
      path === '/api/auth/login'
        ? { data: { username: 'demo' }, response: { ok: true } }
        : { response: { ok: true } },
    )
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('Sign in to your journal')

    await wrapper.get('#username').setValue('demo')
    await wrapper.get('#password').setValue('correct-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Welcome, demo')
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
      body: { username: 'demo', password: 'correct-password' },
    })

    await wrapper.get('.text-button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Sign in to your journal')
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/logout')
  })

  it('shows a useful error for rejected credentials', async () => {
    // Failed sign-in keeps the visitor on the form with a retry path.
    mockApi.post.mockResolvedValue({ data: undefined, response: { status: 401 } })
    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#username').setValue('demo')
    await wrapper.get('#password').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Check your username and password')
    expect((wrapper.get('#password').element as HTMLInputElement).value).toBe('')
  })
})
