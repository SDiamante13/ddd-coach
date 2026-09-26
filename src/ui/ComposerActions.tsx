import { NewConversation } from "./NewConversation.tsx";
import { TryExampleButton } from "./TryExampleButton.tsx";
import type { ClearConfirmation } from "./useClearConfirmation.ts";

type ComposerActionsProps = {
  started: boolean;
  draft: string;
  busy: boolean;
  confirmation: ClearConfirmation;
  conversation: () => string;
  pastedThread: string | undefined;
  onTryExample: () => void;
};

export function ComposerActions(props: ComposerActionsProps) {
  const { started, draft, busy, confirmation, conversation, pastedThread, onTryExample } = props;
  if (started) {
    return <NewConversation busy={busy} confirmation={confirmation} conversation={conversation} pastedThread={pastedThread} draft={draft} />;
  }
  if (draft.trim() === "") return <TryExampleButton onTry={onTryExample} />;
  return null;
}
