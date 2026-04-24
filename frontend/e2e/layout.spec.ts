import { test } from '@playwright/test'

async function bypassAuth(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    const session = { sessionId: 'playwright-test-session', timestamp: Date.now() }
    localStorage.setItem('bookly_session', JSON.stringify(session))
  })
  await page.goto('/chat')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1500)
}

const viewports = [
  { name: 'iphone-14',    width: 390,  height: 844  },
  { name: 'pixel-7',      width: 412,  height: 915  },
  { name: 'ipad',         width: 768,  height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900  },
  { name: 'ultrawide',    width: 1920, height: 1080 },
]

for (const vp of viewports) {
  test(`welcome — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await bypassAuth(page)
    await page.screenshot({ path: `e2e/screenshots/welcome-${vp.name}.png` })
  })
}
