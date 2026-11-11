// Captures README screenshots and short screen recordings of the running app.
//
// Usage (against a production build):
//   npm run build && npx next start -p 3200 &
//   BASE_URL=http://localhost:3200 node scripts/readme-media/capture.mjs
//
// Env:
//   BASE_URL         app URL (default http://localhost:3200)
//   CHROMIUM_PATH    optional Chromium executable (e.g. /opt/pw-browsers/chromium)
//   MEDIA_DIR        output folder (default docs/media)
//   ONLY             comma-separated flow names to run (default: all)
//
// Each flow writes PNG screenshots; flows with `video: true` are also recorded through the
// Chrome DevTools screencast (no Playwright ffmpeg needed) and encoded with the system
// ffmpeg into a .webm, which scripts/readme-media/encode.sh turns into .gif + .mp4.
// New flows: add an entry to FLOWS.

import { chromium } from "@playwright/test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3200";
const MEDIA_DIR = process.env.MEDIA_DIR ?? "docs/media";
const ONLY = process.env.ONLY?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Phone-sized viewport; screenshots at 2x so they stay sharp on GitHub.
const VIEWPORT = { width: 390, height: 844 };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function onboard(page, opts = {}) {
  const { shots, slow = 0 } = opts;
  await page.goto(`${BASE_URL}/onboarding`);
  await page.getByRole("button", { name: "Get started" }).waitFor();
  await pause(400 + slow);
  if (shots) await shots("onboarding-1-welcome");
  await page.getByRole("button", { name: "Get started" }).click();
  await page.getByRole("radio", { name: "Spanish" }).waitFor();
  await pause(slow);
  await page.getByRole("radio", { name: "Spanish" }).click();
  await pause(300 + slow);
  if (shots) await shots("onboarding-2-course");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Regular/ }).waitFor();
  await pause(slow);
  await page.getByRole("radio", { name: /Regular/ }).click();
  await pause(300 + slow);
  if (shots) await shots("onboarding-3-goal");
  await page.getByRole("button", { name: "Start learning" }).click();
  // Onboarding ends on Learn, or (once PLT-007 lands) directly in Lesson 1.
  await page.waitForURL((u) => !u.pathname.startsWith("/onboarding"));
  if (opts.stayInLesson && new URL(page.url()).pathname.startsWith("/lesson/")) return;
  if (new URL(page.url()).pathname !== "/") await page.goto(`${BASE_URL}/`);
  await page.getByRole("heading", { level: 1, name: "Learn" }).waitFor();
  await pause(600 + slow);
}

/** Lesson 1 ("Hello!") steps in content order, answered correctly. */
const LESSON_1 = [
  { kind: "choice", answer: "Hola" },
  { kind: "choice", answer: "Buenos días" },
  {
    kind: "pairs",
    pairs: [
      ["hola", "hello"],
      ["adiós", "goodbye"],
      ["gracias", "thank you"],
      ["bien", "fine"],
      ["buenas noches", "good night"],
    ],
  },
  { kind: "tiles", tiles: ["hola", "cómo", "estás"] },
  { kind: "listen", tiles: ["buenos", "días"] },
  { kind: "choice", answer: "Gracias" },
  { kind: "tiles", tiles: ["fine", "thanks"] },
  { kind: "listen", tiles: ["buenas", "tardes", "cómo", "estás"] },
  { kind: "tiles", tiles: ["bien", "gracias", "adiós"] },
  { kind: "choice", answer: "Buenas tardes" },
  { kind: "tiles", tiles: ["good", "morning", "how", "are", "you"] },
  { kind: "listen", tiles: ["hola", "buenas", "noches"] },
];

async function lessonRouteExists(page) {
  const res = await page.request.get(`${BASE_URL}/lesson/u1-l1-hello`);
  return res.status() < 400;
}

async function addTiles(page, tiles, slow) {
  const bank = page.getByRole("group", { name: "Word bank" });
  for (const tile of tiles) {
    await bank
      .getByRole("button", { name: `Add ${tile}`, exact: true })
      .first()
      .click();
    await pause(slow);
  }
}

/** Records a page via CDP screencast frames, then assembles them with ffmpeg. */
async function startRecording(page, framesDir) {
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  const writes = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = path.join(framesDir, `f${String(frames.length).padStart(5, "0")}.jpg`);
    frames.push({ file, t: metadata.timestamp });
    writes.push(writeFile(file, Buffer.from(data, "base64")));
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 85,
    maxWidth: VIEWPORT.width * 2,
    maxHeight: VIEWPORT.height * 2,
  });
  return async function stop(outFile) {
    await cdp.send("Page.stopScreencast").catch(() => {});
    await Promise.all(writes);
    if (!outFile || frames.length === 0) {
      await rm(framesDir, { recursive: true, force: true });
      return;
    }
    // Concat list with real per-frame durations (screencast only sends frames on change).
    const lines = [];
    frames.forEach((f, i) => {
      const next = frames[i + 1]?.t ?? f.t + 1.0;
      lines.push(
        `file '${path.resolve(f.file)}'`,
        `duration ${Math.max(0.04, next - f.t).toFixed(3)}`,
      );
    });
    lines.push(`file '${path.resolve(frames.at(-1).file)}'`);
    const list = path.join(framesDir, "list.txt");
    await writeFile(list, lines.join("\n"));
    execFileSync("ffmpeg", [
      "-loglevel",
      "error",
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      list,
      "-vf",
      "fps=25,scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      "34",
      outFile,
    ]);
    await rm(framesDir, { recursive: true, force: true });
  };
}

/** Flows: each gets its own browser context (fresh guest). `video: true` records it. */
const FLOWS = {
  onboarding: {
    video: true,
    async run(page, shot) {
      await onboard(page, { shots: shot, slow: 500 });
      await shot("learn");
      await pause(800);
    },
  },
  tabs: {
    video: true,
    async run(page, shot) {
      await onboard(page);
      await pause(500);
      await page.getByRole("link", { name: "Profile" }).click();
      await page.getByRole("heading", { level: 1, name: "Profile" }).waitFor();
      await pause(900);
      await shot("profile");
      await page.getByRole("link", { name: "Learn" }).click();
      await page.getByRole("heading", { level: 1, name: "Learn" }).waitFor();
      await pause(900);
    },
  },
  offline: {
    video: true,
    async run(page, shot, context) {
      await onboard(page);
      await pause(600);
      await context.setOffline(true);
      await page
        .getByText(/offline/i)
        .first()
        .waitFor();
      await pause(900);
      await shot("offline-banner");
      await context.setOffline(false);
      await page
        .getByText(/back online/i)
        .first()
        .waitFor();
      await pause(1200);
      await shot("back-online");
    },
  },
  // Plays Lesson 1 end to end (one deliberate mistake to show the feedback panel).
  // Skipped automatically while the app has no lesson route.
  lesson: {
    video: true,
    async run(page, shot) {
      if (!(await lessonRouteExists(page))) {
        console.log("skipped lesson: no /lesson route in this build");
        return "skip";
      }
      await onboard(page, { stayInLesson: true });
      if (!new URL(page.url()).pathname.startsWith("/lesson/")) {
        await page.goto(`${BASE_URL}/lesson/u1-l1-hello`);
      }
      const slow = 250;
      const heading = () => page.getByTestId("exercise-area").getByRole("heading", { level: 2 });
      // A wrong first answer is re-queued to the end of the lesson.
      const steps = [
        { kind: "choice", answer: "Adiós", wrong: true },
        ...LESSON_1.slice(1),
        LESSON_1[0],
      ];
      for (const [i, step] of steps.entries()) {
        await heading().waitFor();
        await pause(500);
        if (step.kind === "choice") {
          await page.getByRole("radio", { name: step.answer, exact: true }).click();
          await pause(400);
          if (i === 1) await shot("lesson-choice");
          await page.getByRole("button", { name: "Check" }).click();
        } else if (step.kind === "pairs") {
          for (const [n, [learning, known]] of step.pairs.entries()) {
            await page.getByRole("button", { name: learning, exact: true }).click();
            await pause(slow);
            await page.getByRole("button", { name: known, exact: true }).click();
            await pause(slow);
            if (n === 2) await shot("lesson-match-pairs");
          }
        } else if (
          step.kind === "listen" &&
          (await page
            .getByRole("button", { name: "Skip" })
            .waitFor({ timeout: 4000 })
            .then(
              () => true,
              () => false,
            ))
        ) {
          if (i === 4) await shot("lesson-listen");
          await page.getByRole("button", { name: "Skip" }).click();
          continue;
        } else {
          if (step.kind === "listen" && i === 4) await shot("lesson-listen");
          await addTiles(page, step.tiles, slow);
          await pause(300);
          if (i === 3) await shot("lesson-word-bank");
          await page.getByRole("button", { name: "Check" }).click();
        }
        await page.getByRole("button", { name: "Continue" }).waitFor();
        await pause(700);
        if (step.wrong) await shot("lesson-feedback-incorrect");
        if (i === 1) await shot("lesson-feedback-correct");
        await page.getByRole("button", { name: "Continue" }).click();
      }
      await page.getByRole("heading", { level: 1, name: "Lesson complete!" }).waitFor();
      await pause(1500);
      await shot("lesson-results");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("heading", { level: 1, name: "Learn" }).waitFor();
      await pause(1200);
      await shot("learn-lessons");
    },
  },
  notFound: {
    video: false,
    async run(page, shot) {
      await onboard(page);
      await page.goto(`${BASE_URL}/this-page-does-not-exist`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await pause(400);
      await shot("not-found");
    },
  },
};

async function main() {
  await mkdir(MEDIA_DIR, { recursive: true });
  const videoTmp = path.join(MEDIA_DIR, ".video-tmp");
  await rm(videoTmp, { recursive: true, force: true });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  try {
    for (const [name, flow] of Object.entries(FLOWS)) {
      if (ONLY && !ONLY.includes(name)) continue;
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: "dark",
        reducedMotion: "no-preference",
        serviceWorkers: "block",
      });
      const page = await context.newPage();
      const stopRecording = flow.video
        ? await startRecording(page, path.join(videoTmp, name))
        : null;
      const shot = (file) => page.screenshot({ path: path.join(MEDIA_DIR, `${file}.png`) });
      let result;
      try {
        result = await flow.run(page, shot, context);
      } finally {
        if (stopRecording) {
          await stopRecording(result === "skip" ? null : path.join(MEDIA_DIR, `${name}.webm`));
        }
        await context.close();
      }
      if (result !== "skip") console.log(`captured ${name}`);
    }
  } finally {
    await browser.close();
    await rm(videoTmp, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
