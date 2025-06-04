"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Users, User, Trophy, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useJogo } from "./providers"

// Tipos para as opções de personalização
type Avatar = {
  id: number
  name: string
  image: string
  description: string
}

type Dificuldade = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

type ModoJogo = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

// Dados para as opções de personalização
const avatares: Avatar[] = [
  {
    id: 1,
    name: "Matheus",
    image: "/avatares/menino-matematica.png",
    description: "O gênio da matemática que adora resolver problemas difíceis!",
  },
  {
    id: 2,
    name: "Luana",
    image: "/avatares/menina-matematica.png",
    description: "A exploradora de números que encontra soluções criativas!",
  },
  {
    id: 3,
    name: "Robô Calc",
    image: "/avatares/robo-matematica.png",
    description: "O robô que calcula tudo em um piscar de olhos!",
  },
  {
    id: 4,
    name: "Professora Pi",
    image: "/avatares/professora-matematica.png",
    description: "A sábia professora que conhece todos os segredos dos números!",
  },
]

const dificuldades: Dificuldade[] = [
  {
    id: "facil",
    name: "Iniciante",
    description: "Operações simples com números pequenos. Perfeito para começar!",
    icon: <Star className="h-6 w-6 text-yellow-500" />,
  },
  {
    id: "medio",
    name: "Aventureiro",
    description: "Desafios um pouco mais complexos para quem já conhece os números.",
    icon: <Star className="h-6 w-6 text-orange-500" />,
  },
  {
    id: "dificil",
    name: "Especialista",
    description: "Problemas desafiadores para verdadeiros mestres da matemática!",
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
  },
]

const modosJogo: ModoJogo[] = [
  {
    id: "single",
    name: "Aventura Solo",
    description: "Jogue sozinho e supere seus próprios recordes!",
    icon: <User className="h-6 w-6 text-blue-500" />,
  },
  {
    id: "multi",
    name: "Desafio com Amigos",
    description: "Jogue com seus amigos e vejam quem resolve mais rápido!",
    icon: <Users className="h-6 w-6 text-green-500" />,
  },
]

export default function PersonalizacaoJogador() {
  const [activeTab, setActiveTab] = useState("avatar")
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [selectedDificuldade, setSelectedDificuldade] = useState<string | null>(null)
  const [selectedModo, setSelectedModo] = useState<string | null>(null)

  const router = useRouter()
  const { atualizarUsuario } = useJogo()

  // Função para verificar se todas as seleções foram feitas
  const todasSelecoesConcluidas = () => {
    return selectedAvatar !== null && selectedDificuldade !== null && selectedModo !== null
  }

  // Função para avançar para a próxima aba
  const avancarAba = () => {
    if (activeTab === "avatar") setActiveTab("dificuldade")
    else if (activeTab === "dificuldade") setActiveTab("modo")
  }

  // Função para finalizar a personalização e iniciar o jogo
  const iniciarJogo = () => {
    if (todasSelecoesConcluidas()) {
      // Salvar as escolhas no contexto do jogo
      const dadosPersonalizacao = {
        avatar: avatares.find((a) => a.id === selectedAvatar)?.image,
        dificuldade: selectedDificuldade,
        modoJogo: selectedModo,
      }

      atualizarUsuario(dadosPersonalizacao)

      // Redirecionar para a tela do jogo
      router.push("/jogo")
    }
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
        className="z-10 w-full max-w-4xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden bg-white">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 py-6">
            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">Personalize Sua Aventura!</CardTitle>
            <CardDescription className="text-primary-foreground text-lg">
              Escolha como você quer jogar e aprender matemática!
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full rounded-none bg-blue-100">
              <TabsTrigger
                value="avatar"
                className="text-lg py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                1. Personagem
              </TabsTrigger>
              <TabsTrigger
                value="dificuldade"
                className="text-lg py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                disabled={selectedAvatar === null}
              >
                2. Dificuldade
              </TabsTrigger>
              <TabsTrigger
                value="modo"
                className="text-lg py-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                disabled={selectedDificuldade === null}
              >
                3. Modo de Jogo
              </TabsTrigger>
            </TabsList>

            {/* Aba de seleção de avatar */}
            <TabsContent value="avatar" className="p-0">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-center mb-6">Escolha seu personagem!</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {avatares.map((avatar) => (
                    <motion.div
                      key={avatar.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer rounded-2xl p-4 ${
                        selectedAvatar === avatar.id
                          ? "bg-green-100 border-4 border-green-500"
                          : "bg-blue-50 border-2 border-blue-200 hover:border-blue-400"
                      }`}
                      onClick={() => setSelectedAvatar(avatar.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-yellow-300 overflow-hidden mb-4 relative">
                          <img
                            src={avatar.image || "/placeholder.svg"}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                          {selectedAvatar === avatar.id && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-green-500 text-white rounded-full p-1"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </motion.div>
                            </div>
                          )}
                        </div>
                        <h4 className="text-xl font-bold">{avatar.name}</h4>
                        <p className="text-gray-600 mt-2">{avatar.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={avancarAba}
                    disabled={selectedAvatar === null}
                    className="bg-green-500 hover:bg-green-600 text-lg py-6 px-8 rounded-xl"
                  >
                    Próximo <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* Aba de seleção de dificuldade */}
            <TabsContent value="dificuldade" className="p-0">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-center mb-6">Escolha o nível de desafio!</h3>

                <RadioGroup
                  value={selectedDificuldade || ""}
                  onValueChange={setSelectedDificuldade}
                  className="space-y-4"
                >
                  {dificuldades.map((dificuldade) => (
                    <motion.div
                      key={dificuldade.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center space-x-4 rounded-xl p-4 cursor-pointer ${
                        selectedDificuldade === dificuldade.id
                          ? "bg-orange-100 border-2 border-orange-500"
                          : "bg-blue-50 border border-blue-200 hover:border-blue-400"
                      }`}
                      onClick={() => setSelectedDificuldade(dificuldade.id)}
                    >
                      <RadioGroupItem value={dificuldade.id} id={`dificuldade-${dificuldade.id}`} className="sr-only" />
                      <Label
                        htmlFor={`dificuldade-${dificuldade.id}`}
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <div className="mr-4">{dificuldade.icon}</div>
                        <div>
                          <div className="text-xl font-bold">{dificuldade.name}</div>
                          <div className="text-gray-600">{dificuldade.description}</div>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>

                <div className="mt-8 flex justify-between">
                  <Button
                    onClick={() => setActiveTab("avatar")}
                    variant="outline"
                    className="text-lg py-6 px-8 rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={avancarAba}
                    disabled={selectedDificuldade === null}
                    className="bg-orange-500 hover:bg-orange-600 text-lg py-6 px-8 rounded-xl"
                  >
                    Próximo <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* Aba de seleção de modo de jogo */}
            <TabsContent value="modo" className="p-0">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-center mb-6">Como você quer jogar?</h3>

                <RadioGroup value={selectedModo || ""} onValueChange={setSelectedModo} className="space-y-4">
                  {modosJogo.map((modo) => (
                    <motion.div
                      key={modo.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center space-x-4 rounded-xl p-4 cursor-pointer ${
                        selectedModo === modo.id
                          ? "bg-purple-100 border-2 border-purple-500"
                          : "bg-blue-50 border border-blue-200 hover:border-blue-400"
                      }`}
                      onClick={() => setSelectedModo(modo.id)}
                    >
                      <RadioGroupItem value={modo.id} id={`modo-${modo.id}`} className="sr-only" />
                      <Label htmlFor={`modo-${modo.id}`} className="flex items-center flex-1 cursor-pointer">
                        <div className="mr-4">{modo.icon}</div>
                        <div>
                          <div className="text-xl font-bold">{modo.name}</div>
                          <div className="text-gray-600">{modo.description}</div>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>

                <div className="mt-8 flex justify-between">
                  <Button
                    onClick={() => setActiveTab("dificuldade")}
                    variant="outline"
                    className="text-lg py-6 px-8 rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={iniciarJogo}
                    disabled={selectedModo === null}
                    className="bg-purple-500 hover:bg-purple-600 text-lg py-6 px-8 rounded-xl"
                  >
                    Iniciar Aventura! <Trophy className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-center bg-blue-100 py-4">
            <div className="flex items-center space-x-2">
              {selectedAvatar !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
                >
                  1
                </motion.div>
              )}
              {selectedDificuldade !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-orange-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
                >
                  2
                </motion.div>
              )}
              {selectedModo !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-purple-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
                >
                  3
                </motion.div>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

