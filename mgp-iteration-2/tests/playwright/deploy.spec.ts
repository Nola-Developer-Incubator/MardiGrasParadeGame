import { test, expect } from '@playwright/test'

const PAGES_URL = process.env.PREVIEW_URL || process.env.PAGES_URL || `https://${process.env.GITHUB_REPOSITORY_OWNER || process.env.GITHUB_REPOSITORY?.split('/')[0]}.github.io/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'MardiGrasParadeGame'}`

test.describe('Deployed site smoke', () => {
  test('index.html responds and contains root', async ({ request }) => {
    const url = process.env.PREVIEW_URL || PAGES_URL
    const r = await request.get(url)
    expect(r.status()).toBe(200)
    const body = await r.text()
    expect(body).toContain('<div id="root"')
  })
})
