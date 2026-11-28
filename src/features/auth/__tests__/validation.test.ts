import { describe, expect, it } from "vitest";
import { isValidEmail, validateCredentials } from "../validation";

describe("auth form checks (PLT-010 criterion 3)", () => {
  it.each(["a@b.co", " learner@example.com ", "x.y+z@mail.example.de"])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(["", "a", "a@", "@b.co", "a@b", "a b@c.de", "a@b..de", "a@@b.de"])(
    "rejects %j",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );

  it("needs 8 characters on sign-up, any password on log-in", () => {
    expect(validateCredentials({ email: "a@b.co", password: "1234567" }, "sign-up")).toEqual({
      email: null,
      password: "short_password",
    });
    expect(validateCredentials({ email: "a@b.co", password: "12345678" }, "sign-up")).toEqual({
      email: null,
      password: null,
    });
    expect(validateCredentials({ email: "a@b.co", password: "short" }, "log-in").password).toBe(
      null,
    );
    expect(validateCredentials({ email: "nope", password: "" }, "log-in")).toEqual({
      email: "invalid_email",
      password: "missing_password",
    });
  });
});
