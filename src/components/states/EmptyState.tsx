import { useId } from 'react';

export default function EmptyState() {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h2 id={headingId} className="text-xl font-semibold">
        Nenhuma cidade encontrada
      </h2>
      <p className="mt-2 text-slate-300">
        Verifique a grafia ou tente buscar pelo nome de outra cidade.
      </p>
    </section>
  );
}
