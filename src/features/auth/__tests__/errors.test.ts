import { describe, expect, it, vi } from "vitest";
import { isNetworkError, mapAuthError } from "../errors";

describe("mapAuthError (ADR-020 §4)", () => {
  it.each([
    [{ code: "invalid_credentials", status: 400 }, "invalid_credentials"],
    [{ code: "user_not_found", status: 400 }, "invalid_credentials"],
    [{ code: "email_not_confirmed", status: 400 }, "email_not_confirmed"],
    [{ code: "user_already_exists", status: 422 }, "email_taken"],
    [{ code: "email_exists", status: 422 }, "email_taken"],
    [{ code: "weak_password", status: 422 }, "weak_password"],
    [{ code: "over_request_rate_limit", status: 429 }, "rate_limited"],
    [{ code: "over_email_send_rate_limit", status: 429 }, "rate_limited"],
    [{ status: 429 }, "rate_limited"],
    [{ code: "provider_disabled", status: 400 }, "provider_disabled"],
    [{ code: "oauth_provider_not_supported" }, "provider_disabled"],
    [{ code: "otp_expired" }, "link_expired"],
    [{ code: "flow_state_expired" }, "link_expired"],
    [{ code: "bad_code_verifier" }, "link_expired"],
    [{ name: "AuthPKCECodeVerifierMissingError" }, "link_expired"],
    [{ code: "refresh_token_not_found" }, "session_expired"],
    [{ code: "session_not_found" }, "session_expired"],
    [{ name: "AuthRetryableFetchError", status: 0 }, "network"],
    [new TypeError("Failed to fetch"), "network"],
  ])("maps %o to %s", (error, code) => {
    expect(mapAuthError(error)).toBe(code);
  });

  it("maps anything else to unknown and logs only the code", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapAuthError({ code: "x_new", status: 500, message: "secret a@b.c" })).toBe("unknown");
    expect(JSON.stringify(warn.mock.calls)).not.toContain("a@b.c");
    expect(mapAuthError("boom")).toBe("unknown");
    warn.mockRestore();
  });

  it("tells network failures from server answers", () => {
    expect(isNetworkError({ status: 0 })).toBe(true);
    expect(isNetworkError({ status: 400, code: "invalid_credentials" })).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
