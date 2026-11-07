import { describe, expect, it } from "vitest";
import { DB_NAME, DB_SCHEMA_VERSION, SCHEMA_VERSIONS } from "../db";
import { ALL_TABLES } from "../store";
import { createDevice } from "./helpers";

describe("Dexie schema", () => {
  it("has an explicit, increasing version number", () => {
    expect(DB_SCHEMA_VERSION).toBe(1);
    const versions = SCHEMA_VERSIONS.map((v) => v.version);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("opens the polyglow database at that version with every table", async () => {
    const device = createDevice();
    await device.open();
    const db = device.raw();
    await db.open();
    expect(db.name).toBe(DB_NAME);
    expect(db.verno).toBe(DB_SCHEMA_VERSION);
    expect(db.tables.map((t) => t.name).sort()).toEqual([...ALL_TABLES].sort());
    db.close();
  });
});
