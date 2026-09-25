import { AccessGate } from "./ui/AccessGate.tsx";
import { AccessUnreachable } from "./ui/AccessUnreachable.tsx";
import { ConnectionTest } from "./ui/ConnectionTest.tsx";
import { DataFlowNotice } from "./ui/DataFlowNotice.tsx";
import { PurposeLine } from "./ui/PurposeLine.tsx";
import { useAccess } from "./ui/useAccess.ts";

export function App() {
  return (
    <main>
      <h1>DDD Coach</h1>
      <PurposeLine />
      <DataFlowNotice />
      <AccessView />
    </main>
  );
}

function AccessView() {
  const { access, unlock, recheck } = useAccess();
  switch (access) {
    case "checking":
      return <p role="status">Checking access…</p>;
    case "unreachable":
      return <AccessUnreachable onRetry={recheck} />;
    case "locked":
      return <AccessGate onUnlock={unlock} />;
    case "open":
      return <ConnectionTest unlock={unlock} />;
  }
}
