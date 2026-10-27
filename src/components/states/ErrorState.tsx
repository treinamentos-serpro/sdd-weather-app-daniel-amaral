interface ErrorStateProps {
  message?: string;
  kind?: 'timeout' | 'network' | 'invalid-response';
  operation?: 'search' | 'weather';
  onRetry?: () => void;
}

const errorMessages = {
  timeout: 'O tempo limite de espera foi excedido. Tente novamente.',
  network: 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
  'invalid-response': 'O serviço retornou dados inválidos. Tente novamente mais tarde.',
};

export default function ErrorState({
  message,
  kind = 'network',
  operation = 'weather',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center font-sans text-white shadow-glass backdrop-blur-md">
      <div role="alert" aria-atomic="true">
        <h2 className="text-xl font-semibold text-red-300">
          {operation === 'search' ? 'Erro ao buscar cidades' : 'Erro ao consultar o clima'}
        </h2>
        <p className="mt-2 text-slate-200">{message ?? errorMessages[kind]}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={() => onRetry()}
          className="mt-4 rounded-xl bg-accent-400 px-5 py-3 font-semibold text-night-900 transition-colors hover:bg-accent-500 active:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
