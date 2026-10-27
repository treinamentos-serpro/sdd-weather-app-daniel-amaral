interface LoadingStateProps {
  operation?: 'search' | 'weather';
}

export default function LoadingState({ operation = 'weather' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-atomic="true"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center font-sans text-slate-200 shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="mx-auto mb-3 block h-8 w-8 rounded-full border-2 border-white/10 border-t-accent-400 motion-safe:animate-spin"
      />
      <p>{operation === 'search' ? 'Buscando cidades…' : 'Carregando dados meteorológicos…'}</p>
    </div>
  );
}
