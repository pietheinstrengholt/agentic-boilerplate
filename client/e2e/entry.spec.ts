import { expect, test } from '@playwright/test'

for (const scenario of [
  { name: 'wide light', width: 1440, height: 900, colorScheme: 'light' as const },
  { name: 'wide dark', width: 1440, height: 900, colorScheme: 'dark' as const },
  { name: 'narrow light', width: 390, height: 844, colorScheme: 'light' as const },
  { name: 'narrow dark', width: 390, height: 844, colorScheme: 'dark' as const },
]) {
  test(`entry flow at ${scenario.name}`, async ({ page }) => {
    // Exercise the visible states without changing accounts in the local database.
    await page.setViewportSize({ width: scenario.width, height: scenario.height })
    await page.emulateMedia({ colorScheme: scenario.colorScheme })
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: '{"detail":"Sign in required"}',
      }),
    )
    await page.route('**/api/auth/login', async (route) => {
      const body = route.request().postDataJSON() as { username: string; password: string }
      await route.fulfill({
        status: body.username === 'demo' && body.password === 'correct-password' ? 200 : 401,
        contentType: 'application/json',
        body:
          body.password === 'correct-password'
            ? '{"username":"demo"}'
            : '{"detail":"Invalid username or password"}',
      })
    })
    await page.route('**/api/auth/logout', (route) => route.fulfill({ status: 204, body: '' }))

    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Sign in to your journal' })).toBeVisible()
    await page.screenshot({
      path: `test-results/login-${scenario.name.replace(' ', '-')}.png`,
      fullPage: true,
    })
    await page.getByLabel('Username').focus()
    expect(
      await page.getByLabel('Username').evaluate((input) => getComputedStyle(input).outlineStyle),
    ).toBe('solid')
    const button = page.getByRole('button', { name: 'Sign in' })
    const normalColor = await button.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    )
    await button.hover()
    await expect
      .poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor))
      .not.toBe(normalColor)
    await page.getByLabel('Username').fill('demo')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText('Check your username and password')
    await page.getByLabel('Password').fill('correct-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome, demo.' })).toBeVisible()
    await page.screenshot({
      path: `test-results/welcome-${scenario.name.replace(' ', '-')}.png`,
      fullPage: true,
    })
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in to your journal' })).toBeVisible()
    expect(errors).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('restores an account and shows unavailable-server feedback', async ({ page }) => {
  // The loading view and saved session use the same page as first-time sign-in.
  let release: (() => void) | undefined
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/auth/me', async (route) => {
    await gate
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"username":"returning"}',
    })
  })
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('Opening your journal')
  release?.()
  await expect(page.getByRole('heading', { name: 'Welcome, returning.' })).toBeVisible()

  // An unavailable API leaves the form usable and gives a clear retry message.
  await page.unroute('**/api/auth/me')
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"detail":"unavailable"}',
    }),
  )
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Sign in to your journal' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('server is unavailable')
})

test('disables sign-in while the request is pending', async ({ page }) => {
  // Prevent duplicate submissions while the API is checking credentials.
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: '{"detail":"Sign in required"}',
    }),
  )
  let release: (() => void) | undefined
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/auth/login', async (route) => {
    await gate
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"username":"demo"}',
    })
  })
  await page.goto('/')
  await page.getByLabel('Username').fill('demo')
  await page.getByLabel('Password').fill('correct-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
  release?.()
  await expect(page.getByRole('heading', { name: 'Welcome, demo.' })).toBeVisible()
})
