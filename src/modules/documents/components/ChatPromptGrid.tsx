type Props = {
  prompts?: string[];
};

const DEFAULT_PROMPTS = [
  "Summarize this document",
  "What are the key risks?",
  "Give me the main action items",
  "Explain this in simple language",
];

export default function ChatPromptGrid({
  prompts = DEFAULT_PROMPTS,
}: Props) {
  return (
    <div className="mt-8">
      <p className="text-[11px] font-semibold tracking-[0.32em] text-slate-500">
        SUGGESTED PROMPTS
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-[24px] border border-slate-200 bg-white px-6 py-5 text-left text-[16px] font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}