import { NewConversation } from "./NewConversation.tsx";
import type { ClearConfirmation } from "./useClearConfirmation.ts";

type ComposerActionsProps = {
  started: boolean;
  busy: boolean;
  confirmation: ClearConfirmation;
  conversation: () => string;
};

export function ComposerActions({ started, busy, confirmation, conversation }: ComposerActionsProps) {
  if (started) return <NewConversation busy={busy} confirmation={confirmation} conversation={conversation} />;
  return null;
}
