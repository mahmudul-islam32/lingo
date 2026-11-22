/**
 * telc B1: grammar (TELC-001). Sources: grammatik.json (groups, topics, quiz, prod,
 * baukasten, checklist, sprech, sprechdrill, ref) and satzbau.json (guided sentences).
 *
 * Units tb1-u30 … tb1-u36:
 *   u30–u33  one unit per grammar group. Per topic: a rule lesson (3 explain cards: short
 *            rule, step by step + examples, trap + exam hint; then the first quiz items),
 *            then "sentence pattern" lessons (per satzbau option: an explain card with the
 *            pattern, then every sentence as word_bank_translate English → German, why/whyEn
 *            as explanation), with the remaining quiz (choice) and prod items mixed in.
 *   u34      writing toolkit: Brief-Baukasten + letter checklist.
 *   u35      speaking toolkit: Sprechen phrases + speaking drills (task + listen).
 *   u36      reference tables (ref) + Perfekt practice from the irregular-verb table.
 */
import { chunk, data, htmlToPlain, htmlToRich, lesson, rng, slug, unit } from "../lib.mjs";
import { audioSrc, buildTiles, pickDistinct, shuffledOptions, tokens, words } from "./_vg-util.mjs";

const COURSE = "telc-b1-en-de";
const LEVEL = "B1";

const GROUP_EN = [
  "Sentence Structure & Subordinate Clauses",
  "Verbs & Tenses",
  "Cases & Prepositions",
  "Adjectives, Comparison & More",
];

const TOPIC_EN = {
  satzklammer: "Verb Position & the Verb Bracket",
  nebensatz: "Subordinate Clauses: weil, dass, wenn, obwohl …",
  aduso: "Connectors: aber/denn vs. deshalb/trotzdem",
  zweiteilig: "Two-Part Connectors",
  relativ: "Relative Clauses",
  infinitiv: "Infinitive with zu · um … zu · ohne … zu",
  indirekt: "Indirect Questions",
  alswenn: "als vs. wenn (Past)",
  perfekt: "Perfekt: haben or sein",
  praeteritum: "Präteritum: war, hatte + Modal Verbs",
  plusquam: "Plusquamperfekt + nachdem",
  futur: "Futur I: werden + Infinitive",
  modal: "Modal Verbs",
  kii: "Konjunktiv II: Polite & Unreal",
  passiv: "The Passive",
  reflexiv: "Reflexive Verbs",
  imperativ: "The Imperative",
  trennbar: "Separable Verbs",
  lassen: "lassen + brauchen … zu",
  kasus: "Cases: Nominative, Accusative, Dative",
  genitiv: "Genitive & von + Dative",
  adjektiv: "Adjective Endings",
  praepAD: "Prepositions with a Fixed Case",
  wechsel: "Two-Way Prepositions",
  genpraep: "wegen, trotz, während + Genitive",
  tempus: "Time Prepositions: am, um, im, seit, vor, ab",
  verbpraep: "Verbs with Prepositions + darauf/worauf",
  ndekl: "The n-Declension",
  artikelw: "Determiners: dieser, jeder, welcher, alle",
  komparativ: "Comparative & Superlative",
  negation: "Negation: nicht or kein",
  pronomen: "Pronouns & Possessives",
  wortbildung: "Word Order: TeKaMoLo & Details",
  indefinit: "man, jemand, etwas & Co.",
  erstnur: "erst, nur, schon, noch, nicht mehr",
  ableitung: "Word Formation: un-, -ung, -bar, -los",
};

/** English versions of the German `task` lines of transform items. */
const TASK_EN = {
  "Verbinde mit „weil“:": "Join the two sentences with „weil“:",
  "Mach die Bitte höflich (Konjunktiv II):": "Make the request polite (Konjunktiv II):",
  "Schreib den Satz im Perfekt:": "Rewrite the sentence in the Perfekt:",
  "Schreib den Satz im Passiv:": "Rewrite the sentence in the passive:",
  "Vergleiche (Komparativ + als):": "Compare (comparative + als):",
  "Verbinde mit einem Relativsatz:": "Join the sentences with a relative clause:",
  "Verbinde mit „obwohl“:": "Join the two sentences with „obwohl“:",
  "Mach eine höfliche indirekte Frage:": "Turn it into a polite indirect question:",
  "Setz das Verb richtig ein (Hauptsatz):": "Put the verb in correctly (main clause):",
  "Formuliere einen höflichen Wunsch (ich hätte gern / ich würde gern):":
    "Express it as a polite wish (ich hätte gern / ich würde gern):",
};

/**
 * Wrong options for the prod `cloze` items (the source only has the answer). Each is a
 * clearly wrong form in that sentence; correct alternatives from `alts` are never used.
 */
const CLOZE_WRONG = {
  "Ich habe einen|Job gefunden.": ["neue", "neues", "neuer"],
  "Ich hänge das Bild|Wand.": ["an der", "an den"],
  "|des schlechten Wetters bleiben wir zu Hause.": ["Trotz", "Seit"],
  "Ich interessiere mich|Musik.": ["auf", "an"],
  "|Sie mir bitte helfen?": ["Hätten", "Wären"],
  "Ich wohne|zwei Jahren hier.": ["vor", "ab"],
  "Ich fahre jeden Tag|dem Bus zur Arbeit.": ["von", "bei"],
  "Wir|gestern ins Kino gegangen.": ["haben", "werden"],
  "Je mehr ich übe,|besser werde ich.": ["als", "dann"],
  "Ich hoffe,|wir uns bald wiedersehen.": ["ob", "denn"],
};

/** Corrected sentences for the two `fix` items whose correction is not a one-word swap. */
const FIX_SENTENCE = {
  "Ich anrufe dich heute Abend.": "Ich rufe dich heute Abend an.",
  "Wegen dem Regen bleibe ich zu Hause.": "Wegen des Regens bleibe ich zu Hause.",
};

/** English versions of the (German-only) section tips of baukasten / sprech. */
const TIP_EN = {
  "1 · Anrede":
    "Friend → du + „Liebe/r …“. Company/office → Sie + „Sehr geehrte/r …“. Decide once, never mix.",
  "2 · Einleitung":
    "First the reference/reason, then the topic. A „weil“ or „Ich schreibe Ihnen, weil …“ earns linking points right away (criterion II).",
  "3 · Danken": "danken + dative (dir/Ihnen). „im Voraus“ is semi-formal gold.",
  "4 · Höflich bitten (Konjunktiv II)":
    "ALWAYS make formal requests in Konjunktiv II; it is the safest way to criterion-II points.",
  "5 · Vorschlagen":
    "Make suggestions with „Wie wäre es, wenn …“ or „Wir könnten …“: both Konjunktiv II, both B1 level.",
  "6 · Sich beschweren (halbformell)":
    "Stay factual. „Leider musste ich feststellen, dass …“ is the perfect opening.",
  "7 · Zu- & absagen":
    "ALWAYS give a reason when you decline (weil/da). Without a reason you lose criterion II.",
  "8 · Grund nennen":
    "weil (subordinate clause), deshalb (main clause + inversion) or wegen + genitive: alternate them!",
  "9 · Schluss": "A warm closing sentence + „Ich freue mich auf …“ (freuen AUF = future!).",
  "10 · Grußformel":
    "Formal: „Mit freundlichen Grüßen“. Friend: „Viele/Liebe Grüße“. Then your name.",
  "Teil 1 · Sich vorstellen":
    "Be able to talk fluently for ~60–90 seconds. One „weil“ and one „am liebsten“ show structure. Then ask back!",
  "Teil 2 · Meinung sagen":
    "„Meiner Meinung nach“ + verb! Then a reason with weil and an example from your life.",
  "Teil 2 · Zustimmen & widersprechen":
    "Disagreeing politely with „Das sehe ich anders, weil …“ shows B1 level and keeps the conversation going.",
  "Teil 3 · Planen & vorschlagen":
    "Suggestion in Konjunktiv II + a follow-up question. Always involve your partner. Asking back is rated positively!",
  "Teil 3 · Aufgaben verteilen & abschließen":
    "Part 3 MUST end with a result: who, what, when, where. Otherwise you lose points for task completion.",
};

const SECTION_EN = {
  "1 · Anrede": "Salutation",
  "2 · Einleitung": "Opening",
  "3 · Danken": "Thanking",
  "4 · Höflich bitten (Konjunktiv II)": "Polite requests",
  "5 · Vorschlagen": "Suggesting",
  "6 · Sich beschweren (halbformell)": "Complaining",
  "7 · Zu- & absagen": "Accepting & declining",
  "8 · Grund nennen": "Giving reasons",
  "9 · Schluss": "Closing",
  "10 · Grußformel": "Sign-off",
  "Teil 1 · Sich vorstellen": "Part 1 · Introducing yourself",
  "Teil 2 · Meinung sagen": "Part 2 · Giving your opinion",
  "Teil 2 · Zustimmen & widersprechen": "Part 2 · Agreeing & disagreeing",
  "Teil 3 · Planen & vorschlagen": "Part 3 · Planning & suggesting",
  "Teil 3 · Aufgaben verteilen & abschließen": "Part 3 · Sharing tasks & wrapping up",
};

/** English intro for each (German) reference table. */
const REF_EN = {
  vb: [
    "sein · haben · werden",
    "The three key verbs in the present and Präteritum, with their participles.",
  ],
  mod: [
    "Modal verbs",
    "Modal verbs in the present and Präteritum. The modal is in position 2, the infinitive at the end.",
  ],
  irr: [
    "Irregular verbs: Perfekt",
    "Irregular past participles with their auxiliary (sein for movement/change of state, otherwise haben).",
  ],
  adj: [
    "Adjective endings",
    "Endings after der/die/das, after ein/kein/mein and without an article.",
  ],
  kas: [
    "Articles & pronouns by case",
    "Definite/indefinite articles and personal pronouns in nominative, accusative and dative.",
  ],
  prp: [
    "Prepositions by case",
    "Which prepositions always take accusative, dative or genitive, and the two-way prepositions.",
  ],
  kon: [
    "Connectors & word order",
    "The three connector families and where the verb goes after each.",
  ],
  spick: [
    "Cheat sheet: the 12 point-winners",
    "The twelve rules that earn the most points in the telc B1 exam.",
  ],
};

// ---------------------------------------------------------------- helpers

const rich = (s) => htmlToRich(s);
const plain = (s) => htmlToPlain(s);
const both = (en, de) => `${rich(en)}\n\n*Deutsch:* ${rich(de)}`;

/** Reference-table HTML → rich text (tables become bullet lists). */
function refToRich(html) {
  const out = [];
  const re =
    /<table[^>]*>([\s\S]*?)<\/table>|<div class='rn'>([\s\S]*?)<\/div>|<ol[^>]*>([\s\S]*?)<\/ol>/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] != null) {
      const rows = [...m[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
        [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) =>
          rich(c[1]).replace(/,\s*$/, "").trim().replace(/\/$/, "/ –"),
        ),
      );
      const [head, ...body] = rows;
      const lines = body.map((cells) => {
        const label = cells[0] ? `**${cells[0].replace(/\*\*/g, "")}**` : "";
        const rest = cells
          .slice(1)
          .map((c, i) => (head[i + 1] ? `${head[i + 1]}: ${c || "–"}` : c))
          .join(" · ");
        return `- ${head[0] && !cells[0] ? "" : head[0] ? `${head[0]} ` : ""}${label}${label ? " → " : ""}${rest}`;
      });
      out.push(lines.join("\n"));
    } else if (m[2] != null) {
      out.push(rich(m[2]));
    } else {
      const items = [...m[3].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(
        (li, i) => `- ${i + 1}. ${rich(li[1])}`,
      );
      out.push(items.join("\n"));
    }
  }
  return out.join("\n\n");
}

export function build() {
  const g = data("grammatik");
  const satzbau = data("satzbau");
  const random = rng("telc-grammar");
  const topicTitle = (id) => TOPIC_EN[id];
  const cov = {
    topics: new Set(),
    ex: 0,
    quiz: new Set(),
    prod: new Set(),
    satzbau: 0,
    satzbauGroups: 0,
    baukasten: 0,
    checklist: new Set(),
    sprech: 0,
    sprechdrill: new Set(),
    ref: new Set(),
  };
  const bundles = [];
  const grammarLink = (r) => (r ? `\n\n*Grammar:* ${topicTitle(r)}` : "");

  // ---------------------------------------------------------------- per-topic exercises
  const quizExercise = (q) => {
    cov.quiz.add(q);
    const opts = shuffledOptions(
      q.o[q.a],
      q.o.filter((_, i) => i !== q.a),
      random,
    );
    return {
      type: "choice",
      title: q.q.includes("___") ? "Fill the gap" : "Choose the right answer",
      prompt: q.q,
      ...opts,
      explanation: rich(q.w),
    };
  };

  const prodExercises = (p, topicSentences) => {
    cov.prod.add(p);
    if (p.k === "fix") {
      const wrong = p.toks.join(" ");
      const fixed =
        FIX_SENTENCE[wrong] ??
        p.toks.map((t, i) => (i === p.bad ? t.replace(/^[^.,!?]+/, p.fixw) : t)).join(" ");
      if (fixed === wrong) throw new Error(`fix not applied: ${wrong}`);
      const opts = [];
      const seen = new Set();
      p.toks.forEach((t, i) => {
        const w = words(t)[0];
        if (!w || seen.has(w.toLowerCase())) {
          if (i === p.bad) throw new Error(`ambiguous fix ${wrong}`);
          return;
        }
        seen.add(w.toLowerCase());
        opts.push({ i, w });
      });
      const bad = opts.find((o) => o.i === p.bad);
      const ids = opts.map((_, k) => String.fromCharCode(97 + k));
      return [
        {
          type: "choice",
          title: "Find the mistake",
          prompt: `Which word is wrong? „${wrong}“`,
          options: opts.map((o, k) => ({ id: ids[k], text: o.w })),
          correctOptionId: ids[opts.indexOf(bad)],
          explanation: `„${bad.w}“ → „${p.fixw}“: **${fixed}**\n\n${rich(p.w)}`,
        },
        {
          type: "word_bank_translate",
          direction: "to_learning",
          prompt: `Correct the sentence: „${wrong}“`,
          tiles: buildTiles([fixed], topicSentences, random, 3, 24, [bad.w]),
          answers: [fixed],
          explanation: rich(p.w),
        },
      ];
    }
    if (p.k === "order") {
      const ans = p.sol.join(" ");
      return [
        {
          type: "word_bank_translate",
          direction: "to_learning",
          // No distractor tiles: with spare words a different, also correct sentence could be built.
          prompt: "Word order: put all the words in the correct order.",
          tiles: buildTiles([ans], topicSentences, random, 0),
          answers: [ans],
          explanation: rich(p.w),
        },
      ];
    }
    if (p.k === "transform") {
      const taskEn = TASK_EN[p.task];
      if (!taskEn) throw new Error(`no English for task ${p.task}`);
      const answers = [...new Set([p.ans, ...(p.alts ?? [])])];
      return [
        {
          type: "word_bank_translate",
          direction: "to_learning",
          prompt: `${taskEn} ${p.base}`,
          tiles: buildTiles(answers, topicSentences, random, 2),
          answers,
          explanation: `${rich(p.w)}${answers.length > 1 ? `\n\nAlso correct: ${answers.slice(1).join(" · ")}` : ""}\n\n*Deutsch:* ${p.task}`,
        },
      ];
    }
    if (p.k === "cloze") {
      const key = `${p.before}|${p.after}`;
      const wrong = CLOZE_WRONG[key];
      if (!wrong) throw new Error(`no distractors for cloze ${key}`);
      const alts = (p.alts ?? []).filter((a) => a !== p.ans);
      const opts = shuffledOptions(p.ans, wrong, random);
      return [
        {
          type: "choice",
          title: "Fill the gap",
          prompt: `${p.before ? `${p.before} ` : ""}___ ${p.after}${p.gap ? ` ${p.gap}` : ""}`,
          ...opts,
          explanation: `${rich(p.w)}${alts.length ? `\n\nAlso correct: ${alts.join(", ")}` : ""}`,
        },
      ];
    }
    throw new Error(`unknown prod kind ${p.k}`);
  };

  g.groups.forEach((groupName, gi) => {
    const unitId = `tb1-u${30 + gi}`;
    const topics = g.topics.filter((t) => t.g === gi);
    const lessons = [];
    for (const t of topics) {
      cov.topics.add(t.id);
      const name = topicTitle(t.id);
      if (!name) throw new Error(`no English title for ${t.id}`);
      const quiz = g.quiz.filter((q) => q.t === t.id);
      const prod = g.prod.filter((p) => p.t === t.id);
      const options = satzbau[t.id] ?? [];
      const topicSentences = [
        ...options.flatMap((o) => o.s.map((r) => plain(r[0]))),
        ...t.ex.map((e) => plain(e[0])),
      ];
      const examples = t.ex.map(([de, en]) => ({ learning: plain(de), known: plain(en) }));
      cov.ex += t.ex.length;

      const explains = [
        {
          type: "explain",
          title: name,
          body: `${both(t.kurzEn, t.kurzDe)}\n\n*German name:* ${t.t}`,
          examples: examples.slice(0, 3),
        },
        {
          type: "explain",
          title: `${name}: step by step`,
          body: `${rich(t.detEn)}\n\n## Auf Deutsch\n\n${rich(t.detDe)}`,
          examples,
        },
        {
          type: "explain",
          title: "Watch out & exam tip",
          body: `## Common trap\n\n${both(t.trapEn, t.trapDe)}\n\n## In the exam\n\n${both(t.examEn, t.examDe)}\n\n*Source:* ${t.ref}`,
        },
      ];
      const firstQuiz = Math.ceil(quiz.length / 2);
      const ruleLesson = [...explains, ...quiz.slice(0, firstQuiz).map(quizExercise)];

      const sbSegments = options.map((o) => {
        cov.satzbauGroups++;
        const card = {
          type: "explain",
          title: `${plain(o.t)}`,
          body: `${rich(o.me)}\n\n*Deutsch:* ${rich(o.m)}\n\n## Pattern\n\n${rich(o.f)}`,
          examples: o.s.slice(0, 2).map((r) => ({ learning: plain(r[0]), known: plain(r[1]) })),
        };
        const items = o.s.map(([de, en, why, whyEn]) => {
          cov.satzbau++;
          const ans = plain(de);
          const pool = topicSentences.filter((s) => s !== ans);
          return {
            type: "word_bank_translate",
            direction: "to_learning",
            prompt: plain(en),
            tiles: buildTiles([ans], pool, random),
            answers: [ans],
            explanation: `**Why:** ${rich(whyEn)}\n\n*Warum:* ${rich(why)}`,
          };
        });
        return [card, ...items];
      });
      const practice = [
        ...quiz.slice(firstQuiz).map((q) => [quizExercise(q)]),
        ...prod.map((p) => prodExercises(p, topicSentences)),
      ];

      const sbLessons = chunk(sbSegments, 2).map((segs) => segs.flat());
      if (sbLessons.length === 0) sbLessons.push([]);
      // spread practice items over the pattern lessons (round robin, appended at the end)
      practice.forEach((ex, i) => sbLessons[i % sbLessons.length].push(...ex));

      const topicLessons = [
        { title: `${name}: the rule`, exercises: ruleLesson },
        ...sbLessons
          .filter((l) => l.length)
          .map((exs, i) => {
            const heads = exs
              .filter((e) => e.type === "explain")
              .map((e) => e.title.split(/ · |: | \(/)[0]);
            return {
              title: heads.length ? `${name}: ${heads.join(" & ")}` : `${name}: practice`,
              exercises: exs,
              i,
            };
          }),
      ];
      const tip = plain(t.trapEn);
      for (const tl of topicLessons) {
        const n = lessons.length + 1;
        const title = tl.title.length > 120 ? tl.title.slice(0, 120) : tl.title;
        const id = `${unitId}-l${String(n).padStart(2, "0")}-${slug(`${t.id} ${tl.i == null ? "rule" : `p${tl.i + 1}`}`, 40)}`;
        // listen-free; audio not needed
        lessons.push(
          lesson({
            id,
            courseId: COURSE,
            unitId,
            title,
            ...(tip.length <= 280 ? { tip } : {}),
            exercises: tl.exercises,
          }),
        );
      }
    }
    if (lessons.length > 30) throw new Error(`${unitId}: ${lessons.length} lessons`);
    bundles.push(
      unit({
        id: unitId,
        title: `Grammar · ${GROUP_EN[gi]} (${groupName})`,
        description: `${topics.length} topics: ${topics.map((t) => t.t).join(", ")}`.slice(0, 280),
        level: LEVEL,
        lessons,
      }),
    );
  });

  // ---------------------------------------------------------------- phrase sections (Baukasten / Sprechen)
  const allPhraseItems = [...g.baukasten, ...g.sprech].flatMap((s) => s.items);
  const phraseSectionExercises = (sec, sectionPool, lessonId, counter) => {
    const tipEn = TIP_EN[sec.sec];
    if (!tipEn) throw new Error(`no English tip for ${sec.sec}`);
    const out = [
      {
        type: "explain",
        title: `${SECTION_EN[sec.sec]} (${sec.sec.replace(/^\d+ · /, "")})`,
        body: `${tipEn}\n\n*Deutsch:* ${rich(sec.tip)}\n\n${sec.items.map((it) => `- **${plain(it.de)}** = ${it.en}`).join("\n")}`,
        examples: sec.items.map((it) => ({ learning: plain(it.de), known: it.en })),
      },
    ];
    for (const it of sec.items) {
      const de = plain(it.de);
      const wrong = pickDistinct(
        [
          ...sectionPool.filter((o) => o !== it),
          ...allPhraseItems.filter((o) => o !== it && !sectionPool.includes(o)),
        ].slice(0, 12),
        3,
        (o) => plain(o.de),
        [it],
        random,
      ).map((o) => plain(o.de));
      out.push({
        type: "multiple_choice",
        prompt: `Which phrase means „${it.en}“?`,
        ...shuffledOptions(de, wrong, random),
        explanation: `**${de}** = ${it.en}${grammarLink(it.r)}`,
      });
      const others = allPhraseItems.filter((o) => o !== it).map((o) => plain(o.de));
      if (de.includes(" / ")) {
        for (const part of de.split(" / ")) {
          out.push({
            type: "listen",
            audio: audioSrc(`${lessonId}-${counter.n++}`),
            tiles: buildTiles([part], others, random),
            answers: [part],
            explanation: `**${de}** = ${it.en}`,
          });
        }
      } else {
        out.push({
          type: "word_bank_translate",
          direction: "to_learning",
          prompt: it.en,
          tiles: buildTiles([de], others, random),
          answers: [de],
          explanation: `**${de}** = ${it.en}${grammarLink(it.r)}`,
        });
      }
    }
    return out;
  };

  // u34 writing toolkit
  {
    const unitId = "tb1-u34";
    const lessons = [];
    chunk(g.baukasten, 2).forEach((secs) => {
      const n = lessons.length + 1;
      const title = `Letter toolkit: ${secs.map((s) => SECTION_EN[s.sec]).join(" & ")}`;
      const id = `${unitId}-l${String(n).padStart(2, "0")}-${slug(secs.map((s) => SECTION_EN[s.sec]).join(" "), 40)}`;
      const counter = { n: 1 };
      const exercises = secs.flatMap((s) => {
        cov.baukasten += s.items.length;
        return phraseSectionExercises(s, s.items, id, counter);
      });
      lessons.push(
        lesson({
          id,
          courseId: COURSE,
          unitId,
          title,
          tip: "Brief-Baukasten: ready-made building blocks for the telc letter.",
          exercises,
        }),
      );
    });
    // checklist
    const items = g.checklist;
    const exercises = [
      {
        type: "explain",
        title: "Letter checklist: before you hand in",
        body: `Check these ten points before you hand in your letter.\n\n${items.map((c) => `- ${c.en}\n  *${c.de}*`).join("\n")}`,
        examples: items.map((c) => ({ learning: c.de, known: c.en })),
      },
    ];
    for (const c of items) {
      cov.checklist.add(c);
      const wrong = pickDistinct(
        items.filter((o) => o !== c),
        3,
        (o) => o.de,
        [c],
        random,
      ).map((o) => o.de);
      exercises.push({
        type: "multiple_choice",
        prompt: `Which checklist point means: „${c.en}“?`,
        ...shuffledOptions(c.de, wrong, random),
        explanation: `**${c.de}**\n${c.en}${grammarLink(c.r)}`,
      });
    }
    lessons.push(
      lesson({
        id: `${unitId}-l${String(lessons.length + 1).padStart(2, "0")}-letter-checklist`,
        courseId: COURSE,
        unitId,
        title: "Letter checklist",
        tip: "Ten checks that save points in the writing part.",
        exercises,
      }),
    );
    bundles.push(
      unit({
        id: unitId,
        title: "Grammar · Writing Toolkit (Brief-Baukasten)",
        description: "Letter building blocks from salutation to sign-off, plus a final checklist.",
        level: LEVEL,
        lessons,
      }),
    );
  }

  // u35 speaking toolkit
  {
    const unitId = "tb1-u35";
    const lessons = [];
    const groups = [[g.sprech[0], g.sprech[1]], [g.sprech[2]], [g.sprech[3], g.sprech[4]]];
    if (groups.flat().length !== g.sprech.length)
      throw new Error("sprech sections not all grouped");
    for (const secs of groups) {
      const n = lessons.length + 1;
      const title = `Speaking phrases: ${secs.map((s) => SECTION_EN[s.sec].replace(/^Part \d · /, "")).join(" & ")}`;
      const id = `${unitId}-l${String(n).padStart(2, "0")}-${slug(title.replace("Speaking phrases: ", ""), 40)}`;
      const counter = { n: 1 };
      const exercises = secs.flatMap((s) => {
        cov.sprech += s.items.length;
        return phraseSectionExercises(s, s.items, id, counter);
      });
      lessons.push(
        lesson({
          id,
          courseId: COURSE,
          unitId,
          title,
          tip: "Redemittel for the oral exam (Sprechen).",
          exercises,
        }),
      );
    }
    const drillModels = g.sprechdrill.map((d) => d.model);
    chunk(g.sprechdrill, 4).forEach((drills, di) => {
      const n = lessons.length + 1;
      const id = `${unitId}-l${String(n).padStart(2, "0")}-speaking-drills-${di + 1}`;
      const exercises = [];
      let k = 1;
      for (const d of drills) {
        cov.sprechdrill.add(d);
        exercises.push({
          type: "task",
          skill: "speaking",
          title: d.en,
          task: `${d.en}\n\n*Deutsch:* ${d.sit}\n\nSpeak for 20–30 seconds, then compare with the model answer.`,
          modelAnswer: d.model,
          ...(d.r ? { explanation: `*Grammar to use:* ${topicTitle(d.r)}` } : {}),
        });
        for (const sentence of d.model.split(/(?<=[.!?])\s+/)) {
          exercises.push({
            type: "listen",
            audio: audioSrc(`${id}-${k++}`),
            tiles: buildTiles(
              [sentence],
              drillModels.filter((m) => m !== d.model),
              random,
            ),
            answers: [sentence],
            explanation: `From the model answer: ${d.en}`,
          });
        }
      }
      lessons.push(
        lesson({
          id,
          courseId: COURSE,
          unitId,
          title: `Speaking drills ${di + 1}`,
          tip: "Say your answer out loud first, then check the model.",
          exercises,
        }),
      );
    });
    bundles.push(
      unit({
        id: unitId,
        title: "Grammar · Speaking Toolkit (Sprechen)",
        description:
          "Phrases for all three parts of the oral exam and short speaking drills with model answers.",
        level: LEVEL,
        lessons,
      }),
    );
  }

  // u36 reference tables
  {
    const unitId = "tb1-u36";
    const lessons = [];
    const cards = g.ref.map((r) => {
      const en = REF_EN[r.id];
      if (!en) throw new Error(`no English for ref ${r.id}`);
      cov.ref.add(r);
      const body = `${en[1]}\n\n${refToRich(r.html)}`;
      if (body.length > 8000) throw new Error(`ref ${r.id} too long`);
      return { type: "explain", title: `${en[0]} (${r.title.replace(/^⭐\s*/, "")})`, body };
    });
    // Perfekt practice from the irregular-verb table
    const irr = g.ref.find((r) => r.id === "irr");
    const rows = [
      ...irr.html.matchAll(
        /<tr><td>([^<]+)<\/td><td>([^<]+)<\/td><td class='en'>([^<]+)<\/td><\/tr>/g,
      ),
    ].map((m) => ({ inf: m[1], perf: m[2], en: m[3] }));
    if (rows.length < 20) throw new Error("irr table not parsed");
    const irrEx = rows.map((row) => {
      const wrong = pickDistinct(
        rows.filter((o) => o !== row),
        3,
        (o) => o.perf,
        [row],
        random,
      ).map((o) => o.perf);
      return {
        type: "choice",
        title: "Perfekt",
        prompt: `Perfekt von „${row.inf}“ (${row.en}): Ich ___`,
        ...shuffledOptions(row.perf, wrong, random),
        explanation: `**${row.inf}** → **${row.perf}** (${row.en})`,
      };
    });
    const groups = [
      [["vb", "mod"], "Verb tables: sein, haben, werden & modals", []],
      [["irr"], "Irregular verbs: Perfekt 1", irrEx.slice(0, 12)],
      [[], "Irregular verbs: Perfekt 2", irrEx.slice(12)],
      [["adj", "kas"], "Tables: adjective endings & cases", []],
      [["prp", "kon", "spick"], "Tables: prepositions, connectors & cheat sheet", []],
    ];
    for (const [ids, title, extra] of groups) {
      const exercises = [
        ...ids.map((rid) => cards[g.ref.findIndex((r) => r.id === rid)]),
        ...extra,
      ];
      const n = lessons.length + 1;
      lessons.push(
        lesson({
          id: `${unitId}-l${String(n).padStart(2, "0")}-${slug(title, 40)}`,
          courseId: COURSE,
          unitId,
          title,
          exercises,
        }),
      );
    }
    if (groups.flatMap((x) => x[0]).length !== g.ref.length)
      throw new Error("ref tables not all placed");
    bundles.push(
      unit({
        id: unitId,
        title: "Grammar · Reference Tables",
        description: "Verb, case, preposition and connector tables plus the 12-point cheat sheet.",
        level: LEVEL,
        lessons,
      }),
    );
  }

  // ---------------------------------------------------------------- coverage check
  const sbTotal = Object.values(satzbau).reduce(
    (n, os) => n + os.reduce((m, o) => m + o.s.length, 0),
    0,
  );
  const sbGroups = Object.values(satzbau).reduce((n, os) => n + os.length, 0);
  const exTotal = g.topics.reduce((n, t) => n + t.ex.length, 0);
  const checks = [
    ["topics", cov.topics.size, g.topics.length],
    ["topic examples (ex)", cov.ex, exTotal],
    ["quiz", cov.quiz.size, g.quiz.length],
    ["prod", cov.prod.size, g.prod.length],
    ["satzbau options", cov.satzbauGroups, sbGroups],
    ["satzbau sentences", cov.satzbau, sbTotal],
    ["baukasten items", cov.baukasten, g.baukasten.reduce((n, s) => n + s.items.length, 0)],
    ["checklist", cov.checklist.size, g.checklist.length],
    ["sprech items", cov.sprech, g.sprech.reduce((n, s) => n + s.items.length, 0)],
    ["sprechdrill", cov.sprechdrill.size, g.sprechdrill.length],
    ["ref tables", cov.ref.size, g.ref.length],
  ];
  for (const [k, have, want] of checks)
    if (have !== want) throw new Error(`grammar coverage ${k}: ${have}/${want}`);
  const unknown = Object.keys(satzbau).filter((k) => !g.topics.some((t) => t.id === k));
  if (unknown.length) throw new Error(`satzbau topics without grammar topic: ${unknown}`);
  console.log(`grammar coverage: ${checks.map(([k, h, w]) => `${k} ${h}/${w}`).join(", ")}`);
  void tokens;
  return bundles;
}
