import { AccessGate } from "./ui/AccessGate.tsx";
import { ConnectionTest } from "./ui/ConnectionTest.tsx";
import { DataFlowNotice } from "./ui/DataFlowNotice.tsx";
import { PurposeLine } from "./ui/PurposeLine.tsx";
import { useAccess, type AccessState, type Unlock } from "./ui/useAccess.ts";

export function App() {
  const { access, unlock } = useAccess();
  return (
    <main>
      <h1>DDD Coach</h1>
      <PurposeLine />
      <DataFlowNotice />
      <AccessView access={access} unlock={unlock} />
    </main>
  );
}

function AccessView({ access, unlock }: { access: AccessState; unlock: Unlock }) {
  if (access === "checking") return <p role="status">Checking access…</p>;
  if (access === "locked") return <AccessGate onUnlock={unlock} />;
  return <ConnectionTest unlock={unlock} />;
}
