const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let currentMouseX = 960;
let currentMouseY = 540;

async function smoothMove(page, targetX, targetY, duration = 500) {
  const steps = Math.floor(duration / 15);
  const startX = currentMouseX;
  const startY = currentMouseY;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const x = startX + (targetX - startX) * easeT;
    const y = startY + (targetY - startY) * easeT;
    await page.mouse.move(x, y);
    await delay(15);
  }
  currentMouseX = targetX;
  currentMouseY = targetY;
}

async function record() {
  const timingsPath = path.join(__dirname, 'assets', 'timings.json');
  let timings = {
    scene1: 10000,
    scene2: 12000,
    scene3: 14000,
    scene4: 12000,
    scene5: 14000,
    scene6: 12000,
  };
  if (fs.existsSync(timingsPath)) {
    try {
      timings = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));
    } catch {}
  }

  const framesDir = path.join(__dirname, 'assets', 'frames');
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.0,
  });

  const page = await context.newPage();

  let recording = true;
  let frameCount = 0;
  let concatList = '';
  let lastTime = Date.now();

  const captureLoop = async () => {
    while (recording) {
      try {
        const frameName = `frame_${String(frameCount).padStart(5, '0')}.png`;
        const framePath = path.join(framesDir, frameName);
        await page.screenshot({ path: framePath, type: 'png' });
        const now = Date.now();
        const durationSec = ((now - lastTime) / 1000).toFixed(3);
        if (frameCount > 0) concatList += `duration ${durationSec}\n`;
        concatList += `file 'frames/${frameName}'\n`;
        lastTime = now;
        frameCount++;
      } catch (err) {}
      await delay(100);
    }
    concatList += `duration 1.000\n`;
    fs.writeFileSync(path.join(__dirname, 'assets', 'concat.txt'), concatList);
  };

  console.log('[Recorder] Navigating to LexiShield...');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await delay(1000);

  // Inject visible cursor
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.42c.45 0 .67-.54.35-.85L5.85 2.86a.5.5 0 00-.85.35z" fill="#0284C7" stroke="white" stroke-width="1.5"/></svg>';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.left = '960px';
    cursor.style.top = '540px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });

  captureLoop();

  console.log('[Recorder] Scene 1: Overview...');
  await delay(timings.scene1 || 10000);

  console.log('[Recorder] Scene 2: Selecting Contract...');
  await smoothMove(page, 450, 420, 600);
  await page.click('button:has-text("Freelance Software Development Agreement")');
  await delay(1500);

  await smoothMove(page, 1300, 720, 600);
  await page.click('button:has-text("Run Dual-Stage Audit")');
  await delay(timings.scene2 || 12000);

  console.log('[Recorder] Scene 3: Reviewing Gotchas...');
  await page.mouse.wheel(0, 350);
  await delay(timings.scene3 || 14000);

  console.log('[Recorder] Scene 4: Opening Counter-Draft...');
  const counterBtn = await page.$('button:has-text("Counter-Draft Proposal")');
  if (counterBtn) {
    await counterBtn.click();
    await delay(4000);
    await page.click('button:has-text("Copy Negotiation Email")');
    await delay(2000);
    await page.click('button:has-text("Close")');
  }
  await delay(timings.scene4 || 12000);

  console.log('[Recorder] Scene 5: Document Counsel Chat...');
  await page.click('button:has-text("Document Counsel")');
  await delay(2000);
  await page.click('button:has-text("Can the counterparty terminate this agreement without cause?")');
  await delay(timings.scene5 || 14000);

  console.log('[Recorder] Scene 6: Compliance & Brief...');
  await page.click('button:has-text("Compliance Checklist")');
  await delay(4000);
  await page.click('button:has-text("Attorney Brief")');
  await delay(timings.scene6 || 12000);

  recording = false;
  await delay(1000);
  await browser.close();
  console.log('[Recorder] Finished screen capture.');
}

record().catch(console.error);
