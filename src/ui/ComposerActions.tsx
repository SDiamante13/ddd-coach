import { NewConversation } from "./NewConversation.tsx";
import { TryExampleButton } from "./TryExampleButton.tsx";
import type { ClearConfirmation } from "./useClearConfirmation.ts";

type ComposerActionsProps = {
  started: boolean;
  draftBlank: boolean;
  busy: boolean;
  confirmation: ClearConfirmation;
  conversation: () => string;
  onTryExample: () => void;
};

export function ComposerActions(props: ComposerActionsProps) {
  const { started, draftBlank, busy, confirmation, conversation, onTryExample } = props;
  if (started) return <NewConversation busy={busy} confirmation={confirmation} conversation={conversation} />;
  if (draftBlank) return <TryExampleButton onTry={onTryExample} />;
  return null;
}
