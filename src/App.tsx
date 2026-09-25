import { ConnectionTest } from "./ui/ConnectionTest.tsx";
import { DataFlowNotice } from "./ui/DataFlowNotice.tsx";

export function App() {
  return (
    <main>
      <h1>DDD Coach</h1>
      <DataFlowNotice />
      <ConnectionTest />
    </main>
  );
}
