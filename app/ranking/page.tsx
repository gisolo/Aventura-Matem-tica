"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useJogo } from "@/components/providers"
import { ArrowLeft, Trophy } from "lucide-react"

type JogadorRanking = {
  id: string
  nome: string
  username: string
  avatar?: string
  pontuacao: number
  nivel: number
}

export default function RankingPage() {
  const router = useRouter()
  const { usuario, estaLogado } = useJogo()
  const [ranking, setRanking] = useState<JogadorRanking[]>([])

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!estaLogado) {
      router.push("/")
    }
  }, [estaLogado, router])

  // Carregar ranking
  useEffect(() => {
    const carregarRanking = () => {
      try {
        // Obter usuários do localStorage
        const usuariosSalvos = localStorage.getItem("usuarios")
        if (usuariosSalvos) {
          const usuarios = JSON.parse(usuariosSalvos)

          // Filtrar e mapear apenas os dados necessários
          const jogadoresRanking = usuarios
            .map((u: any) => ({
              id: u.id,
              nome: u.nome || u.username,
              username: u.username,
              avatar: u.avatar || "/avatares/menino-matematica.png",
              pontuacao: u.pontuacao || 0,
              nivel: u.nivel || 1,
            }))
            .sort((a: JogadorRanking, b: JogadorRanking) => b.pontuacao - a.pontuacao)
            .slice(0, 10) // Top 10

          setRanking(jogadoresRanking)
        }
      } catch (error) {
        console.error("Erro ao carregar ranking:", error)
      }
    }

    carregarRanking()
  }, [])

  if (!estaLogado) {
    return null
  }

  return (
    <div className="min-h-screen bg-[url('/math-background.png')] bg-repeat relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70 z-0"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 py-6">
            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg flex items-center justify-center">
              <Trophy className="mr-2 h-8 w-8" />
              Ranking dos Campeões
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {ranking.length > 0 ? (
              <div className="space-y-4">
                {ranking.map((jogador, index) => (
                  <motion.div
                    key={jogador.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-3 rounded-lg ${
                      jogador.id === usuario?.id ? "bg-yellow-100 border-2 border-yellow-400" : "bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center font-bold">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </div>
                    <Avatar className="h-10 w-10 mx-2">
                      <AvatarImage src={jogador.avatar} alt={jogador.nome} />
                      <AvatarFallback>{jogador.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold">{jogador.nome}</div>
                      <div className="text-sm text-muted-foreground">Nível {jogador.nivel}</div>
                    </div>
                    <div className="font-bold text-yellow-500">{jogador.pontuacao}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-500">Ainda não há jogadores no ranking.</p>
                <p className="text-sm text-gray-400 mt-2">Seja o primeiro a jogar e pontuar!</p>
              </div>
            )}

            <div className="mt-8">
              <Button onClick={() => router.push("/menu")} variant="outline" className="w-full py-4 text-lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar ao Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

