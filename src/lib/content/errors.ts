/** Typed errors of the content repository. Check with `instanceof` or `error.code`. */

export type ContentErrorCode = "content_not_found" | "content_invalid";

export class ContentError extends Error {
  constructor(
    readonly code: ContentErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** The course or lesson id is not part of the bundled content. */
export class ContentNotFoundError extends ContentError {
  constructor(
    readonly kind: "course" | "lesson",
    readonly id: string,
  ) {
    super("content_not_found", `Unknown ${kind} "${id}".`);
  }
}

/**
 * A content file failed its contract schema (or doesn't match its manifest entry).
 * `issues` are `"<field path>: <message>"` strings; `file` names the content file.
 */
export class ContentValidationError extends ContentError {
  constructor(
    readonly file: string,
    readonly issues: readonly string[],
  ) {
    super("content_invalid", `Invalid content in ${file}: ${issues.join("; ")}`);
  }
}
