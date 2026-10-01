import { useState } from "react";
import { FOLLOW_COACH_AT_START, type Session } from "../domain/session.ts";

export function useBoardPlace(kept: Session) {
  const [viewport, keepViewport] = useState(kept.viewport);
  const [followingCoach, setFollowingCoach] = useState(kept.followingCoach);
  const reset = () => {
    keepViewport(null);
    setFollowingCoach(FOLLOW_COACH_AT_START);
  };
  return { viewport, keepViewport, followingCoach, setFollowingCoach, reset };
}
