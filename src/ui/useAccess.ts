import { useEffect, useState } from "react";
import { checkAccess, unlock, type Access, type UnlockResult } from "../api/access.ts";

export type AccessState = Access | "checking";
export type Unlock = (password: string) => Promise<UnlockResult>;

export function useAccess() {
  const [access, setAccess] = useState<AccessState>("checking");
  const refresh = () => void checkAccess().then(setAccess);
  const recheck = () => {
    setAccess("checking");
    refresh();
  };
  useEffect(refresh, []);
  const tryUnlock: Unlock = async (password) => {
    const result = await unlock(password);
    if (result.ok) setAccess("open");
    return result;
  };
  return { access, unlock: tryUnlock, recheck };
}
