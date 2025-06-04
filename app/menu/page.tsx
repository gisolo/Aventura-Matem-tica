"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useJogo } from "@/components/providers"
import { Play, Settings, Trophy, User, LogOut } from "lucide-react"

export default function MenuPage() {
  const router = useRouter()
  const { usuario, estaLogado, logout } = useJogo()

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!estaLogado) {
      router.push("/")
    }
  }, [estaLogado, router])

  if (!estaLogado || !usuario) {
    return null // Não renderizar nada enquanto verifica o login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/math-background.png')] bg-repeat p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70 z-0"></div>

      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-10 left-10 animate-bounce text-6xl">➕</div>
      <div className="absolute top-20 right-20 animate-bounce delay-100 text-6xl">➖</div>
      <div className="absolute bottom-10 left-20 animate-bounce delay-200 text-6xl">✖️</div>
      <div className="absolute bottom-20 right-10 animate-bounce delay-300 text-6xl">➗</div>

      <motion.div
        className="z-10 w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <Avatar className="h-24 w-24 border-4 border-blue-400 mb-4">
                <AvatarImage src={usuario.avatar || "/avatares/menino-matematica.png"} alt={usuario.nome} />
                <AvatarFallback>{usuario.nome?.charAt(0) || "J"}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">Olá, {usuario.nome || usuario.username}!</h1>
              <p className="text-muted-foreground">Pronto para uma aventura matemática?</p>
            </div>

            <div className="space-y-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => router.push("/personalizacao")}
                  className="w-full py-6 text-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Play className="mr-2 h-6 w-6" />
                  Jogar Agora
                </Button>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/personalizacao")}
                    className="w-full py-4 text-lg"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Personalizar
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => router.push("/ranking")} className="w-full py-4 text-lg">
                    <Trophy className="mr-2 h-5 w-5" />
                    Ranking
                  </Button>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/configuracoes")}
                    className="w-full py-4 text-lg"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Configurações
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout()
                      router.push("/")
                    }}
                    className="w-full py-4 text-lg"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sair
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

