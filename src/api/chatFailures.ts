import type { Failure } from "../domain/exchange.ts";
import { ACCESS_REQUIRED } from "../shared/accessContract.ts";
import {
  COACH_EMPTY_REPLY,
  COACH_GLOSSARY_TOO_LONG,
  COACH_MALFORMED,
  COACH_MESSAGE_TOO_LONG,
  COACH_OUT_OF_CREDIT,
  COACH_TIMED_OUT,
  COACH_TOO_LONG,
  COACH_UNAVAILABLE,
  COACH_UNVERIFIED,
  coachUnavailableFor,
  type ChatFailureReason,
} from "../shared/chatContract.ts";

const FAILURES: Record<ChatFailureReason, Failure> = {
  malformed: { error: COACH_MALFORMED, remedy: "copy" },
  conversation_too_long: { error: COACH_TOO_LONG, remedy: "startOver" },
  message_too_long: { error: COACH_MESSAGE_TOO_LONG, remedy: "copy" },
  glossary_too_long: { error: COACH_GLOSSARY_TOO_LONG, remedy: "copy" },
  unverified: { error: COACH_UNVERIFIED, remedy: "startOver" },
  access_expired: { error: ACCESS_REQUIRED, remedy: "unlock" },
  credit_exhausted: { error: COACH_OUT_OF_CREDIT, remedy: "copy" },
  timed_out: { error: COACH_TIMED_OUT, remedy: "retry" },
  empty_reply: { error: COACH_EMPTY_REPLY, remedy: "retry" },
  unavailable: { error: COACH_UNAVAILABLE, remedy: "retry" },
};

export function failureFor(reason: ChatFailureReason, retryAfterSeconds?: number): Failure {
  if (reason !== "unavailable" || retryAfterSeconds === undefined) return FAILURES[reason];
  return { error: coachUnavailableFor(retryAfterSeconds), remedy: "retry", retryAfterSeconds };
}
