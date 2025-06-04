"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useJogo } from "@/components/providers"
import { ArrowLeft, Volume2, VolumeX, Trash2 } from "lucide-react"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { usuario, estaLogado, logout } = useJogo()

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!estaLogado) {
      router.push("/")
    }
  }, [estaLogado, router])

  if (!estaLogado) {
    return null
  }

  // Função para limpar dados do jogo
  const limparDados = () => {
    if (confirm("Tem certeza que deseja apagar todos os seus dados? Esta ação não pode ser desfeita.")) {
      logout()
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-[url('/math-background.png')] bg-repeat relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70 z-0"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 py-6">
            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">Configurações</CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Som e Música</h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5" />
                  <Label htmlFor="som">Som do Jogo</Label>
                </div>
                <Switch id="som" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <VolumeX className="h-5 w-5" />
                  <Label htmlFor="musica">Música de Fundo</Label>
                </div>
                <Switch id="musica" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume</Label>
                <Slider defaultValue={[80]} max={100} step={1} id="volume" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Acessibilidade</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="animacoes">Animações Reduzidas</Label>
                <Switch id="animacoes" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="contraste">Alto Contraste</Label>
                <Switch id="contraste" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Conta</h3>

              <Button variant="destructive" className="w-full" onClick={limparDados}>
                <Trash2 className="mr-2 h-5 w-5" />
                Apagar Meus Dados
              </Button>
            </div>

            <div className="pt-4">
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

