export type LeadMeasure = { cardTop: number; anchorBottom: number; scrollTop: number; bottomInset: number };

export const questionLead = ({ cardTop, anchorBottom, scrollTop, bottomInset }: LeadMeasure): number =>
  Math.ceil(anchorBottom - cardTop + scrollTop + bottomInset);
