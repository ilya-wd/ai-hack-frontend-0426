interface Props {
  question: string;
}

export function ClarificationBanner({ question }: Props) {
  return (
    <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
      <span className="text-xl">🤔</span>
      <div>
        <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-0.5">Agent needs clarification</p>
        <p className="text-sm text-violet-900">{question}</p>
      </div>
    </div>
  );
}
