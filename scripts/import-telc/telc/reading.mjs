/**
 * telc B1 Leseverstehen (lese.json, app logic sessions/Lesen.jsx + screens/hubs.jsx LesenHub).
 * Units tb1-u40 … tb1-u43 (u44 unused): Teil 1 headlines, Teil 2 detail, Teil 3 ads,
 * Paraphrasen-Drill.
 */
import { chunk, data, htmlToPlain, htmlToRich, optionId, rng, shuffled, unit } from "../lib.mjs";
import {
  allText,
  covered,
  explain,
  mkLesson,
  readingT1,
  readingT2,
  readingT3,
} from "./_exam-util.mjs";

const METHOD_DE =
  "**Methode:** Erst die Aufgabe lesen, dann den Text. In Teil 1 zuerst die Überschriften streichen, die ein Detail **umdrehen** („profitieren“ statt „Staus“).";

const overviewCard = explain(
  "Reading (Leseverstehen): the exam part",
  [
    "Reading is worth **75 points** in the written telc B1 exam and has three parts:",
    "- **Teil 1 · Globalverstehen** (25 P): 5 short texts, 10 headlines. Match one headline to each text; 5 headlines stay unused. 5 points per text.\n- **Teil 2 · Detailverstehen** (25 P): one article, 5 questions, a, b or c. 5 points per question.\n- **Teil 3 · Selektives Verstehen** (25 P): 10 situations, 12 ads. Each ad fits at most once; if no ad fits, the answer is **x**. 2.5 points per situation.",
    "Reading and Sprachbausteine share one 90-minute block in the exam (tasks 1–40), so you split the time yourself.",
    "## The method",
    METHOD_DE,
    '*Read the task first, then the text. In Part 1, first cross out the headlines that flip a detail ("profitieren" instead of "Staus").*',
  ].join("\n\n"),
);

const t1Card = (set) =>
  explain(
    `Teil 1 · ${set.theme}: how to match headlines`,
    [
      "**5 texts · 10 headlines · 5 stay unused.** Each headline fits only one text.",
      '- Read all 10 headlines first and look for pairs: one headline says what the text says, its twin turns a detail around (the opposite, a wrong cause, an invented fact).\n- A headline that only repeats a word from the text ("Bücher", "Radwege") is often the trap: it recycles the word but changes the message.\n- Decide by the main message of the text, not by single words.',
      "In this lesson the headlines are always listed in the same order (A–J), like the answer sheet. Remember which ones you have already used.",
    ].join("\n\n"),
  );

const t2Card = (set) =>
  explain(
    `Teil 2 · ${set.title}`,
    [
      `**One article (${set.theme}) · ${set.qs.length} questions · a, b or c.** The questions follow the order of the text.`,
      "- Read the question first, then find the matching place in the text.\n- The right answer usually says the same thing in **other words** (a paraphrase).\n- Watch the *Weltwissen-Falle*: an answer that sounds logical but is not in the text. Also watch answers that recycle a word from the text and turn it around.",
    ].join("\n\n"),
  );

const t3Card = (set) =>
  explain(
    `Teil 3 · ${set.theme}: situations and ads`,
    [
      `**${set.sits.length} situations · ${set.ads.length} ads.** Each ad fits at most once; **x** = no ad fits.`,
      "- Every situation has **two conditions** (*Bedingungen*), e.g. *Deutschkurs + abends*. An ad only fits if it meets **both**.\n- Typical traps: the right topic but the wrong time (morning instead of evening), renting instead of buying, the wrong target group (children instead of adults).\n- Usually one or two situations have no matching ad: dare to choose x.",
      "A multiple-choice card can show at most 12 options, so for each situation one clearly unrelated ad is left out of the list.",
    ].join("\n\n"),
  );

/** Paraphrase drill: alternate the direction (text → task wording, task wording → text). */
function paraExercises(pairs, offset) {
  return pairs.map(([text, task], i) => {
    const random = rng(`para-${offset + i}`);
    const forward = (offset + i) % 2 === 0;
    const pool = pairs.filter((p) => p[0] !== text);
    const distract = shuffled(pool, random)
      .slice(0, 3)
      .map((p) => (forward ? p[1] : p[0]));
    const correct = forward ? task : text;
    const options = [...distract];
    options.splice(((offset + i) * 3 + 1) % 4, 0, correct); // balanced answer positions
    return {
      type: "choice",
      title: "Paraphrasen-Drill",
      prompt: forward
        ? `Im Text steht „${text}“. Wie sagt es die Aufgabe mit einfachen Worten?`
        : `In der Aufgabe steht „${task}“. Welches Wort steht im Text?`,
      options: options.map((t, k) => ({ id: optionId(k), text: t })),
      correctOptionId: optionId(options.indexOf(correct)),
      explanation: `Im Text: **${text}** = in der Aufgabe: **${task}**`,
    };
  });
}

export function build() {
  const lese = data("lese");
  const units = [];

  // u40 · Teil 1
  const u40 = "tb1-u40";
  const l40 = lese.t1.map((set, k) =>
    mkLesson(
      u40,
      k + 1,
      `teil1-${set.theme}`,
      `Headlines ${k + 1}: ${set.theme}`,
      [...(k === 0 ? [overviewCard] : []), t1Card(set), ...readingT1(set)],
      "Match each text with one headline. Five headlines stay unused.",
    ),
  );
  units.push(
    unit({
      id: u40,
      title: "Reading (Lesen) · Part 1 · Headlines",
      description: "Globalverstehen: match 5 short texts to 10 headlines.",
      level: "B1",
      lessons: l40,
    }),
  );

  // u41 · Teil 2
  const u41 = "tb1-u41";
  const l41 = lese.t2.map((set, k) =>
    mkLesson(
      u41,
      k + 1,
      `teil2-${set.title}`,
      `Article ${k + 1}: ${set.title}`,
      [t2Card(set), ...readingT2(set)],
      "Read the question first, then find the place in the text.",
    ),
  );
  units.push(
    unit({
      id: u41,
      title: "Reading (Lesen) · Part 2 · Detailed reading",
      description: "Detailverstehen: one article, five questions, a, b or c.",
      level: "B1",
      lessons: l41,
    }),
  );

  // u42 · Teil 3
  const u42 = "tb1-u42";
  const l42 = lese.t3.map((set, k) =>
    mkLesson(
      u42,
      k + 1,
      `teil3-${set.theme}`,
      `Ads ${k + 1}: ${set.theme}`,
      [t3Card(set), ...readingT3(set)],
      "Each ad fits only once. Check both conditions. x = no ad fits.",
    ),
  );
  units.push(
    unit({
      id: u42,
      title: "Reading (Lesen) · Part 3 · Ads",
      description: "Selektives Verstehen: 10 situations, 12 ads, x when nothing fits.",
      level: "B1",
      lessons: l42,
    }),
  );

  // u43 · Paraphrasen
  const u43 = "tb1-u43";
  let offset = 0;
  const l43 = chunk(lese.para, 11).map((pairs, k) => {
    const card = explain(
      `Paraphrases ${k + 1}: the text says it differently`,
      [
        "*Die Aufgabe sagt es anders als der Text.* In the reading tasks the answer rarely repeats the words of the text. Learn these pairs: left the word in the text, right how the task says it.",
        pairs.map(([a, b]) => `- **${htmlToRich(a)}** → ${htmlToRich(b)}`).join("\n"),
      ].join("\n\n"),
    );
    const ex = paraExercises(pairs, offset);
    offset += pairs.length;
    return mkLesson(
      u43,
      k + 1,
      `paraphrasen-${k + 1}`,
      `Paraphrases ${k + 1}`,
      [card, ...ex],
      "Text and task use different words for the same thing.",
    );
  });
  units.push(
    unit({
      id: u43,
      title: "Reading (Lesen) · Paraphrases",
      description: "Paraphrasen-Drill: the words in the text vs. the words in the task.",
      level: "B1",
      lessons: l43,
    }),
  );

  // ---- coverage
  const text = allText(units.flatMap((u) => u.lessons));
  const report = [
    covered(
      "t1.texts",
      lese.t1.flatMap((s) => s.texts.map(htmlToRich)),
      text,
    ),
    covered(
      "t1.heads",
      lese.t1.flatMap((s) => s.heads.map(htmlToPlain)),
      text,
    ),
    covered(
      "t1.w",
      lese.t1.flatMap((s) =>
        s.w.map((w) =>
          htmlToRich(w)
            .replace(/\bFalle [a-j]\b/g, "")
            .slice(0, 25),
        ),
      ),
      text,
    ),
    covered(
      "t2.art",
      lese.t2.flatMap((s) => s.art.map(htmlToRich)),
      text,
    ),
    covered(
      "t2.qs",
      lese.t2.flatMap((s) => s.qs.flatMap((q) => [htmlToPlain(q.q), ...q.o.map(htmlToPlain)])),
      text,
    ),
    covered(
      "t2.w",
      lese.t2.flatMap((s) => s.qs.map((q) => htmlToRich(q.w).slice(-15))),
      text,
    ),
    covered(
      "t3.sits",
      lese.t3.flatMap((s) => s.sits.map((x) => htmlToRich(x.de))),
      text,
    ),
    covered(
      "t3.conditions",
      lese.t3.flatMap((s) => s.sits.map((x) => x.c.map(htmlToPlain).join(" + "))),
      text,
    ),
    covered(
      "t3.ads",
      lese.t3.flatMap((s) => s.ads.map(htmlToPlain)),
      text,
    ),
    covered(
      "t3.w",
      lese.t3.flatMap((s) => s.w.filter(Boolean).map((w) => htmlToRich(w).slice(-12))),
      text,
    ),
    covered(
      "para",
      lese.para.flatMap(([a, b]) => [`**${a}** = in der Aufgabe: **${b}**`]),
      text,
    ),
  ];
  console.log(`reading coverage · ${report.join(" · ")}`);
  return units;
}
