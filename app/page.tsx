import LoginRegisterForm from "@/components/login-register-form"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/math-background.png')] bg-repeat p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70 z-0"></div>

      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-10 left-10 animate-bounce text-6xl">➕</div>
      <div className="absolute top-20 right-20 animate-bounce delay-100 text-6xl">➖</div>
      <div className="absolute bottom-10 left-20 animate-bounce delay-200 text-6xl">✖️</div>
      <div className="absolute bottom-20 right-10 animate-bounce delay-300 text-6xl">➗</div>

      <div className="z-10">
        <LoginRegisterForm />
      </div>
    </main>
  )
}

