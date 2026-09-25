# Market research: synthetic ICP interviews

After each completed slice, the loop runs one synthetic interview with the [ICP avatar](icp-avatar.md). A slice counts as complete when a new `outputs/demos/slice-NN.md` is committed.

Each interview ships as a transcript `.md` plus a styled `.html` page (EventStorming sticky palette; reuse interview-01 as the template).

Synthetic interviews generate hypotheses, not evidence. Promote an insight only after a real practitioner confirms it.

## Log

| # | After slice | Interview | Top takeaway |
|---|---|---|---|
| 1 | 01 (slice 2 code landed, no demo yet) | [md](interviews/interview-01-after-slice-01.md) · [html](interviews/interview-01-after-slice-01.html) | Value = facilitator questions + disagreement surfacing from pasted mess; needs persistence across reload, export, data-flow notice; voice-at-desk doubtful |
| 2 | 02 + Design Exploration 01 | [md](interviews/interview-02-after-slice-02.md) · [html](interviews/interview-02-after-slice-02.html) | Slice 2 moved none of her asks; AI policy (Claude Enterprise + Copilot only) blocks OpenRouter for real work; term map = RFC glossary; "Dana said" risks misquoting the expert |

Last interviewed demo: `slice-02.md`

## Queued for interview 03

- Covered in the revised 02: the exact #2 notice wording ("No wording turns an unapproved vendor into an approved one") and the minimum export (rich text; term table → questions with status → events).
- The "Ask next time" questions from interview 02.
- The PO's probe (decision #34): would a "bring your own Anthropic key" field be acceptable, or does it break "no settings before first reply"? Also ask whether her Claude Enterprise workspace even hands out API keys, and what security would say about her pasting one in.
- The PO's ask: if the design-tokens restyle (#42) has shipped, show the restyled screen and ask whether it looks trustworthy enough to show her domain expert (Dana). Get a past-behavior anchor too: the last tool she showed Dana, and how Dana reacted.
- **Design Exploration 01b** (`outputs/design/explore-01/untangle-v2.html`, stills `v2-1-paste.png … v2-5-notes.png`, `explore-01b-2.5x.mp4`). Show the stills in order. Probes:
  - Is anonymising on by default enough for her AI policy? Her policy objects to the vendor, and to customer names, rates and contract terms, not only to people's names.
  - Does "my notes from Dana · unconfirmed" stop Dana worrying about being quoted?
  - Does the coach's proposed test with load 48213 feel like facilitation, or like homework?
  - Is "Dictate instead" for post-call notes something she'd use? Past behavior: has she ever dictated notes?
