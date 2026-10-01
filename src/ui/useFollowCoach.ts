import { useEffect, useState } from "react";

export const FOLLOW_PAUSED = "Follow paused while you work";
const PAUSED_FOR_MS = 3000;

export type FollowCoach = { followingCoach: boolean; setFollowingCoach: (following: boolean) => void };

export function useFollowCoach({ followingCoach, setFollowingCoach }: FollowCoach, announce: (text: string) => void) {
  const [followPaused, setFollowPaused] = useState(false);
  useEffect(() => {
    if (!followPaused) return;
    const timer = setTimeout(() => setFollowPaused(false), PAUSED_FOR_MS);
    return () => clearTimeout(timer);
  }, [followPaused]);
  const pauseFollow = () => {
    if (!followingCoach) return;
    setFollowingCoach(false);
    setFollowPaused(true);
    announce(FOLLOW_PAUSED);
  };
  const switchFollow = (following: boolean) => {
    setFollowPaused(false);
    setFollowingCoach(following);
  };
  return { followingCoach, followPaused, pauseFollow, setFollowingCoach: switchFollow };
}
