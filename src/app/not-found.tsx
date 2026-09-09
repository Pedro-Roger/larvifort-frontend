import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-dot-matrix min-h-screen flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <main className="w-full max-w-[490px] flex flex-col items-center text-center">
        <div className="mb-6 text-8xl font-black text-slate-200 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
          Página não encontrada
        </h1>
        <p className="text-base text-gray-500 mb-8">
          O endereço que você procurou não existe ou foi movido.
        </p>
        <Link
          className="inline-flex h-12 items-center justify-center rounded-xl bg-black px-6 text-white font-medium text-base transition-all hover:bg-neutral-800 active:bg-neutral-900"
          href="/"
        >
          Voltar ao início
        </Link>
      </main>
    </div>
  );
}
