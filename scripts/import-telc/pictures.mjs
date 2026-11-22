/**
 * Pictures for the Einbürgerungstest picture questions (TELC-005, PD-076).
 *
 * The images are the ones of the BAMF Gesamtfragenkatalog "Leben in Deutschland" /
 * Einbürgerungstest (Stand 07.05.2025), extracted from the catalogue PDF, resized and
 * stored in `public/images/eb/` (file names never give the answer away). Where the real
 * test shows "Bild 1–4" or numbered pictures, the options become those labels and the
 * correct option is the catalogue's; the alt texts describe each picture without naming
 * it. `note` lists what each picture is, after the answer, in the explanation.
 *
 * Only questions that can't be answered without the picture get one. The telc app
 * rewrote 70, 176, 181, 187, 216 and 235 so they work without their picture.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const CREDIT = "Bilder: BAMF, Gesamtfragenkatalog „Leben in Deutschland“ (Stand 07.05.2025)";
const BILD = ["Bild 1", "Bild 2", "Bild 3", "Bild 4"];

const grid = (prefix, ext, alts, credit = CREDIT) => ({
  images: alts.map((alt, i) => ({
    src: `/images/eb/${prefix}-bild-${i + 1}.${ext}`,
    alt,
    label: BILD[i],
  })),
  credit,
});

/** Shared by Q21 and Q209 (the catalogue uses the same four pictures). */
const ARMS_BUND_DDR = [
  "A black eagle with a red beak and red claws on a golden-yellow shield",
  "A black symbol made of two crossed letters, X and P",
  "A grey cross with flared arms, framed in dark blue and white",
  "A golden hammer and compass on a red circle, framed by ears of wheat and a black-red-gold ribbon",
];

/** Keyed by question label ("Q21", "NDS-1"). `o` / `a` replace the source's options. */
export const PICTURES = {
  Q21: {
    o: BILD,
    a: 0,
    figure: grid("q21", "png", ARMS_BUND_DDR),
    note: "**The pictures:** Bild 1 = Bundesadler (correct) · Bild 2 = Christusmonogramm (Chi-Rho, a Christian symbol) · Bild 3 = Eisernes Kreuz of the Bundeswehr · Bild 4 = coat of arms of the DDR (→Q209).",
  },
  Q55: {
    figure: {
      images: [
        {
          src: "/images/eb/q55.jpg",
          alt: "Photo of a large stone building with columns and a glass dome, German flags on the roof and a wide square in front",
        },
      ],
      credit:
        "Foto: © Deutscher Bundestag/Achim Melde (BAMF, Gesamtfragenkatalog, Stand 07.05.2025)",
    },
  },
  Q130: {
    o: ["Stimmzettel 1", "Stimmzettel 2", "Stimmzettel 3", "Stimmzettel 4"],
    a: 0,
    figure: {
      images: [
        {
          src: "/images/eb/q130.jpg",
          alt: "Four sample Bundestag ballots, numbered 1–4, each with a left column (Erststimme) and a right column (Zweitstimme). 1: one cross left, one right. 2: none left, two right. 3: two left, none right. 4: three left, none right.",
        },
      ],
      credit: CREDIT,
    },
    note: "**The ballots:** 1 = one cross per column (valid) · 2 = two crosses in the Zweitstimme column · 3 = two crosses in the Erststimme column · 4 = three crosses in the Erststimme column.",
  },
  Q209: {
    o: BILD,
    a: 3,
    figure: grid("q21", "png", ARMS_BUND_DDR),
    note: "**The pictures:** Bild 1 = Bundesadler (→Q21) · Bild 2 = Christusmonogramm (Chi-Rho, a Christian symbol) · Bild 3 = Eisernes Kreuz of the Bundeswehr · Bild 4 = coat of arms of the DDR (correct).",
  },
  Q226: {
    o: BILD,
    a: 1,
    figure: grid("q226", "jpg", [
      "A flag with red and white stripes and white stars on a blue rectangle",
      "A blue flag with a circle of twelve golden stars",
      "A light-blue flag with a white world map framed by two olive branches",
      "A dark-blue flag with a yellow stylised letter C and short rays around it",
    ]),
    note: "**The pictures:** Bild 1 = USA · Bild 2 = European Union (correct) · Bild 3 = United Nations · Bild 4 = CEFTA (Central European Free Trade Agreement).",
  },
  "NDS-1": {
    figure: grid("nds-1", "png", [
      "Blue and white lozenges under a golden crown",
      "Two blue lions on gold beside a white nettle leaf on red",
      "A white leaping horse filling a red shield",
      "Black and yellow stripes with a green crown of rue across them",
    ]),
  },
  "NDS-8": {
    figure: {
      images: [
        {
          src: "/images/eb/nds-8.jpg",
          alt: "Map of Germany with four Länder highlighted and numbered: 1 is a large Land in the northwest on the North Sea; 2 is in the middle of Germany; 3 lies east of it on the Elbe; 4 is in the southeast, on the borders with Poland and the Czech Republic.",
        },
      ],
      credit: CREDIT,
    },
  },
};

/** Applies PICTURES to the (already transformed) `eb.json` data. Throws on a missing file. */
export function withPictures(eb) {
  const byLabel = new Map(eb.qs.map((q) => [q.label, q]));
  for (const [label, pic] of Object.entries(PICTURES)) {
    if (!byLabel.has(label)) throw new Error(`pictures: no question ${label}`);
    for (const image of pic.figure.images) {
      if (!existsSync(join(ROOT, "public", image.src))) {
        throw new Error(`pictures: ${label} image ${image.src} is missing in public/`);
      }
    }
  }
  return {
    ...eb,
    qs: eb.qs.map((q) => {
      const pic = PICTURES[q.label];
      if (!pic) return q;
      return {
        ...q,
        img: true,
        ...(pic.o ? { o: pic.o, a: pic.a } : {}),
        figure: pic.figure,
        ...(pic.note ? { pictureNote: pic.note } : {}),
      };
    }),
  };
}
