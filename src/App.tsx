import { ConnectionTest } from "./ui/ConnectionTest.tsx";
import { DataFlowNotice } from "./ui/DataFlowNotice.tsx";
import { PurposeLine } from "./ui/PurposeLine.tsx";

export function App() {
  return (
    <main>
      <h1>DDD Coach</h1>
      <PurposeLine />
      <DataFlowNotice />
      <ConnectionTest />
    </main>
  );
}
