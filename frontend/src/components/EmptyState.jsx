import ThemedIllustration from './ThemedIllustration';

export default function EmptyState({ kind = 'default', text }) {
  return (
    <div className="text-center py-12">
      <ThemedIllustration kind={kind} className="w-20 h-20 rounded-full mx-auto mb-4" />
      <p className="text-sm text-bronze/60">{text}</p>
    </div>
  );
}
