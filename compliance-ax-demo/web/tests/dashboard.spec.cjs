const { test, expect } = require('@playwright/test');
const { readFile } = require('node:fs/promises');

test('sample dashboard, filters, details, and scenario delta states', async ({ page }) => {
  const errors=[];
  const external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8766')&&!r.url().startsWith('data:'))external.push(r.url());});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'오늘의 이슈, 다음의 대응.'})).toBeVisible();
  await expect(page.locator('#issue-list .issue-card')).toHaveCount(4);
  await page.getByRole('searchbox',{name:'이슈 검색'}).fill('개인정보');
  await expect(page.locator('#issue-list .issue-card')).toHaveCount(1);
  await page.getByRole('button',{name:'[가상] 개인정보 처리 가이드',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('개인정보/IT');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('searchbox',{name:'이슈 검색'}).fill('없는검색어');
  await expect(page.getByText('조건에 맞는 이슈가 없습니다.')).toBeVisible();
  await page.getByRole('searchbox',{name:'이슈 검색'}).fill('');
  await page.getByRole('combobox',{name:'중요도 필터'}).selectOption('하');
  await expect(page.locator('#issue-list .issue-card')).toHaveCount(1);
  await page.getByRole('combobox',{name:'중요도 필터'}).selectOption('all');
  await page.getByRole('button',{name:'변경 시나리오 체험'}).click();
  await expect(page.locator('#issue-list .issue-card')).toHaveCount(5);
  for(const state of ['신규','변경','동일','처리 완료','수집 범위 제외']) await expect(page.locator('#issue-list .status-pill').filter({hasText:new RegExp(`^${state}$`)})).toHaveCount(1);
  await page.getByRole('combobox',{name:'변경 상태 필터'}).selectOption('UPDATED');
  await page.getByRole('button',{name:'[가상] 가맹점 계약 안내 개정',exact:true}).click();
  await expect(page.getByRole('dialog').locator('pre')).toContainText('사전 고지');
  await page.getByRole('button',{name:'상세 닫기'}).click();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('saved items survive reload and briefing downloads as Markdown',async({page})=>{
  await page.goto('/');
  await page.locator('#issue-list .bookmark').first().click();
  await page.getByRole('button',{name:/검토 보관함/}).click();
  await expect(page.locator('#saved-list .issue-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#saved-list .issue-card')).toHaveCount(1);
  await page.getByRole('button',{name:'보관함 비우기'}).click();
  await expect(page.getByText('아직 보관한 이슈가 없습니다.')).toBeVisible();
  await page.getByRole('button',{name:'데일리 브리핑',exact:true}).click();
  await expect(page.locator('.briefing-item')).toHaveCount(4);
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'브리핑 저장'}).click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.md$/);
  const text=await readFile(await download.path(),'utf8');
  expect(text).toContain('가상 데이터 공개 데모');
  expect(text).toContain('가맹점 계약 안내 개정');
});

test('mobile layout and blocked browser storage remain usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable')}}));
  await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#issue-list .bookmark').first().click();
  await page.getByRole('button',{name:/검토 보관함/}).click();
  await expect(page.locator('#saved-list .issue-card')).toHaveCount(1);
  await page.getByRole('button',{name:'시스템 정보',exact:true}).click();
  await expect(page.getByRole('heading',{name:'투명하게 확인하는 작동 범위.'})).toBeVisible();
  await expect(page.getByText('Disabled',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
