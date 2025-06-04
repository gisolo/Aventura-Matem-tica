"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Heart,
  Save,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react"

// Tipos para o jogo
type Operacao = "+" | "-" | "*" | "/"
type Dificuldade = "facil" | "medio" | "dificil"
type ModoJogo = "single" | "multi"

type Questao = {
  id: number
  num1: number
  num2: number
  operacao: Operacao
  respostaCorreta: number
  opcoes: number[]
}

type Jogador = {
  id: number
  nome: string
  avatar: string
  pontuacao: number
  vidas: number
  nivel: number
}

type ConfiguracaoJogo = {
  dificuldade: Dificuldade
  modo: ModoJogo
  tempoQuestao: number // em segundos
  totalQuestoes: number
}

// Função para gerar uma questão baseada na dificuldade
const gerarQuestao = (id: number, dificuldade: Dificuldade): Questao => {
  // Definir limites baseados na dificuldade
  let maxNum = 10
  if (dificuldade === "medio") maxNum = 20
  if (dificuldade === "dificil") maxNum = 50

  // Gerar números aleatórios
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1

  // Escolher operação aleatória
  const operacoes: Operacao[] = ["+", "-", "*", "/"]
  let operacao: Operacao

  // Para divisão, garantir que seja uma divisão exata
  if (dificuldade === "facil") {
    // Fácil: apenas adição e subtração
    operacao = operacoes[Math.floor(Math.random() * 2)] as Operacao
  } else {
    // Médio e difícil: todas as operações
    operacao = operacoes[Math.floor(Math.random() * operacoes.length)] as Operacao
  }

  // Ajustar para garantir que subtração não resulte em negativo e divisão seja exata
  let n1 = num1
  let n2 = num2

  if (operacao === "-" && num2 > num1) {
    // Trocar para garantir resultado positivo
    n1 = num2
    n2 = num1
  }

  if (operacao === "/") {
    // Garantir divisão exata
    n2 = Math.max(1, n2) // Evitar divisão por zero
    n1 = n2 * Math.floor(Math.random() * 10 + 1)
  }

  // Calcular resposta correta
  let respostaCorreta: number
  switch (operacao) {
    case "+":
      respostaCorreta = n1 + n2
      break
    case "-":
      respostaCorreta = n1 - n2
      break
    case "*":
      respostaCorreta = n1 * n2
      break
    case "/":
      respostaCorreta = n1 / n2
      break
  }

  // Gerar opções de resposta (incluindo a correta)
  const opcoes: number[] = [respostaCorreta]

  // Gerar 3 opções incorretas
  while (opcoes.length < 4) {
    let opcaoIncorreta: number

    // Gerar opção incorreta baseada na operação
    if (operacao === "+") {
      opcaoIncorreta = respostaCorreta + Math.floor(Math.random() * 10) - 5
    } else if (operacao === "-") {
      opcaoIncorreta = respostaCorreta + Math.floor(Math.random() * 10) - 5
    } else if (operacao === "*") {
      opcaoIncorreta = respostaCorreta + Math.floor((Math.random() * respostaCorreta) / 2) - respostaCorreta / 4
    } else {
      opcaoIncorreta = respostaCorreta + Math.floor(Math.random() * 5) - 2
    }

    // Garantir que a opção incorreta seja diferente da correta e não esteja já nas opções
    if (opcaoIncorreta !== respostaCorreta && !opcoes.includes(opcaoIncorreta) && opcaoIncorreta > 0) {
      opcoes.push(opcaoIncorreta)
    }
  }

  // Embaralhar as opções
  opcoes.sort(() => Math.random() - 0.5)

  return {
    id,
    num1: n1,
    num2: n2,
    operacao,
    respostaCorreta,
    opcoes,
  }
}

// Componente principal do jogo
export default function JogoMatematica() {
  // Estado para configurações do jogo
  const [config, setConfig] = useState<ConfiguracaoJogo>({
    dificuldade: "facil",
    modo: "single",
    tempoQuestao: 15,
    totalQuestoes: 10,
  })

  // Estado para o jogador
  const [jogador, setJogador] = useState<Jogador>({
    id: 1,
    nome: "Jogador 1",
    avatar: "/avatares/menino-matematica.png",
    pontuacao: 0,
    vidas: 3,
    nivel: 1,
  })

  // Estados do jogo
  const [questaoAtual, setQuestaoAtual] = useState<Questao | null>(null)
  const [questaoIndex, setQuestaoIndex] = useState(0)
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)
  const [respostaCorreta, setRespostaCorreta] = useState<boolean | null>(null)
  const [tempo, setTempo] = useState(config.tempoQuestao)
  const [jogoIniciado, setJogoIniciado] = useState(false)
  const [jogoTerminado, setJogoTerminado] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [somAtivado, setSomAtivado] = useState(true)
  const [ranking, setRanking] = useState<Jogador[]>([
    { id: 2, nome: "Campeão", avatar: "/avatares/robo-matematica.png", pontuacao: 950, vidas: 3, nivel: 5 },
    { id: 3, nome: "Gênio", avatar: "/avatares/professora-matematica.png", pontuacao: 820, vidas: 2, nivel: 4 },
    { id: 4, nome: "Calculadora", avatar: "/avatares/menina-matematica.png", pontuacao: 750, vidas: 1, nivel: 3 },
  ])

  // Efeito para iniciar o jogo
  useEffect(() => {
    if (jogoIniciado && !jogoTerminado && !pausado) {
      // Gerar primeira questão
      if (!questaoAtual) {
        const novaQuestao = gerarQuestao(1, config.dificuldade)
        setQuestaoAtual(novaQuestao)
        setTempo(config.tempoQuestao)
      }

      // Timer para contagem regressiva
      const timer = setInterval(() => {
        setTempo((tempoAnterior) => {
          if (tempoAnterior <= 1) {
            clearInterval(timer)
            // Tempo esgotado, considerar como resposta errada
            if (respostaSelecionada === null) {
              handleResposta(-1)
            }
            return 0
          }
          return tempoAnterior - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [jogoIniciado, jogoTerminado, pausado, questaoAtual, config.tempoQuestao, respostaSelecionada])

  // Função para iniciar o jogo
  const iniciarJogo = () => {
    setJogoIniciado(true)
    setJogoTerminado(false)
    setQuestaoIndex(0)
    setJogador({
      ...jogador,
      pontuacao: 0,
      vidas: 3,
    })
    const novaQuestao = gerarQuestao(1, config.dificuldade)
    setQuestaoAtual(novaQuestao)
    setTempo(config.tempoQuestao)
    setRespostaSelecionada(null)
    setRespostaCorreta(null)
  }

  // Função para verificar resposta
  const handleResposta = (resposta: number) => {
    if (questaoAtual && respostaSelecionada === null) {
      setRespostaSelecionada(resposta)

      const estaCorreto = resposta === questaoAtual.respostaCorreta
      setRespostaCorreta(estaCorreto)

      // Atualizar pontuação e vidas
      if (estaCorreto) {
        // Resposta correta: adicionar pontos
        const pontosPorQuestao = config.dificuldade === "facil" ? 10 : config.dificuldade === "medio" ? 20 : 30
        const bonusTempo = Math.floor(tempo * 0.5) // Bônus pelo tempo restante
        const pontos = pontosPorQuestao + bonusTempo

        setJogador((prev) => ({
          ...prev,
          pontuacao: prev.pontuacao + pontos,
        }))
      } else {
        // Resposta incorreta: perder vida
        setJogador((prev) => ({
          ...prev,
          vidas: prev.vidas - 1,
        }))
      }

      // Aguardar um pouco antes de passar para a próxima questão
      setTimeout(() => {
        if (!estaCorreto && jogador.vidas <= 1) {
          // Fim de jogo se acabaram as vidas
          setJogoTerminado(true)
          // Atualizar ranking
          setRanking((prev) => {
            const novoRanking = [...prev, jogador].sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 5)
            return novoRanking
          })
        } else if (questaoIndex + 1 >= config.totalQuestoes) {
          // Fim de jogo se atingiu o total de questões
          setJogoTerminado(true)
          // Atualizar ranking
          setRanking((prev) => {
            const novoRanking = [...prev, jogador].sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 5)
            return novoRanking
          })
        } else {
          // Próxima questão
          const proximoIndex = questaoIndex + 1
          const novaQuestao = gerarQuestao(proximoIndex + 1, config.dificuldade)
          setQuestaoIndex(proximoIndex)
          setQuestaoAtual(novaQuestao)
          setTempo(config.tempoQuestao)
          setRespostaSelecionada(null)
          setRespostaCorreta(null)
        }
      }, 2000)
    }
  }

  // Função para pausar/continuar o jogo
  const togglePause = () => {
    setPausado(!pausado)
  }

  // Função para salvar o jogo
  const salvarJogo = () => {
    // Aqui você implementaria a lógica para salvar o estado do jogo
    alert("Jogo salvo com sucesso!")
  }

  // Função para reiniciar o jogo
  const reiniciarJogo = () => {
    iniciarJogo()
  }

  // Função para voltar ao menu
  const voltarAoMenu = () => {
    setJogoIniciado(false)
    setJogoTerminado(false)
  }

  // Função para alternar o som
  const toggleSom = () => {
    setSomAtivado(!somAtivado)
  }

  // Renderizar símbolo da operação
  const renderOperacao = (op: Operacao) => {
    switch (op) {
      case "+":
        return "+"
      case "-":
        return "-"
      case "*":
        return "×"
      case "/":
        return "÷"
    }
  }

  // Renderizar tela de início
  const renderTelaInicio = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold mb-6">Aventura Matemática</h1>
        <p className="text-xl mb-8">Teste suas habilidades com as quatro operações!</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-8"
      >
        <img
          src={jogador.avatar || "/placeholder.svg"}
          alt="Avatar do jogador"
          className="w-32 h-32 rounded-full border-4 border-yellow-400"
        />
        <h2 className="text-2xl font-bold mt-4">{jogador.nome}</h2>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4 w-full max-w-md"
      >
        <Button onClick={iniciarJogo} className="w-full text-xl py-6 bg-green-500 hover:bg-green-600">
          Iniciar Aventura! 🚀
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="text-lg py-4"
            onClick={() => {
              // Aqui você redirecionaria para a tela de personalização
              alert("Redirecionando para personalização...")
            }}
          >
            Personalizar
          </Button>
          <Button
            variant="outline"
            className="text-lg py-4"
            onClick={() => {
              // Aqui você redirecionaria para a tela de configurações
              alert("Redirecionando para configurações...")
            }}
          >
            Configurações
          </Button>
        </div>
      </motion.div>
    </div>
  )

  // Renderizar tela de jogo
  const renderTelaJogo = () => (
    <div className="p-4">
      {/* Cabeçalho com informações do jogador */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 border-2 border-yellow-400">
            <AvatarImage src={jogador.avatar} alt={jogador.nome} />
            <AvatarFallback>{jogador.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold">{jogador.nome}</div>
            <div className="text-sm text-muted-foreground">Nível {jogador.nivel}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>{jogador.pontuacao}</span>
          </Badge>

          <div className="flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-6 w-6 ${i < jogador.vidas ? "text-red-500 fill-red-500" : "text-gray-300"}`}
              />
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={togglePause}>
            {pausado ? <ChevronRight className="h-5 w-5" /> : <span className="font-bold">II</span>}
          </Button>
        </div>
      </div>

      {/* Barra de progresso do tempo */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Tempo restante</span>
          <span>{tempo}s</span>
        </div>
        <Progress value={(tempo / config.tempoQuestao) * 100} className="h-2" />
      </div>

      {/* Questão atual */}
      {questaoAtual && (
        <div className="mb-8">
          <div className="text-center mb-2">
            <Badge variant="outline" className="px-3 py-1">
              Questão {questaoIndex + 1} de {config.totalQuestoes}
            </Badge>
          </div>

          <Card className="border-4 border-blue-300">
            <CardContent className="p-6">
              <motion.div
                key={questaoAtual.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center text-4xl font-bold space-x-4"
              >
                <span>{questaoAtual.num1}</span>
                <span className="text-blue-500">{renderOperacao(questaoAtual.operacao)}</span>
                <span>{questaoAtual.num2}</span>
                <span>=</span>
                <span className="text-purple-500">?</span>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Opções de resposta */}
      {questaoAtual && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {questaoAtual.opcoes.map((opcao, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={`w-full h-20 text-2xl font-bold rounded-xl border-2 ${
                  respostaSelecionada === null
                    ? "hover:bg-blue-100 hover:border-blue-500"
                    : respostaSelecionada === opcao
                      ? respostaCorreta
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                      : opcao === questaoAtual.respostaCorreta && respostaSelecionada !== null
                        ? "bg-green-100 border-green-500"
                        : "opacity-70"
                }`}
                disabled={respostaSelecionada !== null}
                onClick={() => handleResposta(opcao)}
              >
                {opcao}
                {respostaSelecionada === opcao && respostaCorreta && (
                  <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                )}
                {respostaSelecionada === opcao && !respostaCorreta && <XCircle className="ml-2 h-5 w-5 text-red-500" />}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Menu de pausa */}
      {pausado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Jogo Pausado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={togglePause} className="w-full py-4 text-lg bg-green-500 hover:bg-green-600">
                Continuar
              </Button>
              <Button onClick={salvarJogo} variant="outline" className="w-full py-4 text-lg">
                <Save className="mr-2 h-5 w-5" />
                Salvar Jogo
              </Button>
              <Button onClick={reiniciarJogo} variant="outline" className="w-full py-4 text-lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reiniciar
              </Button>
              <Button onClick={toggleSom} variant="outline" className="w-full py-4 text-lg">
                {somAtivado ? (
                  <>
                    <Volume2 className="mr-2 h-5 w-5" />
                    Som: Ligado
                  </>
                ) : (
                  <>
                    <VolumeX className="mr-2 h-5 w-5" />
                    Som: Desligado
                  </>
                )}
              </Button>
              <Button onClick={voltarAoMenu} variant="outline" className="w-full py-4 text-lg">
                <Home className="mr-2 h-5 w-5" />
                Menu Principal
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )

  // Renderizar tela de fim de jogo
  const renderTelaFimJogo = () => (
    <div className="p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Fim da Aventura!</h2>
        <p className="text-xl">
          Sua pontuação: <span className="font-bold text-yellow-500">{jogador.pontuacao}</span>
        </p>
      </motion.div>

      <Tabs defaultValue="resultado" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="resultado">Seu Resultado</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="resultado" className="p-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-4 border-yellow-400">
                  <AvatarImage src={jogador.avatar} alt={jogador.nome} />
                  <AvatarFallback>{jogador.nome.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Pontuação</div>
                  <div className="text-2xl font-bold">{jogador.pontuacao}</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Nível</div>
                  <div className="text-2xl font-bold">{jogador.nivel}</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Questões</div>
                  <div className="text-2xl font-bold">
                    {questaoIndex + 1}/{config.totalQuestoes}
                  </div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Vidas Restantes</div>
                  <div className="text-2xl font-bold">{jogador.vidas}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="p-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center">Melhores Jogadores</h3>

              <div className="space-y-4">
                {ranking.map((jogadorRanking, index) => (
                  <motion.div
                    key={jogadorRanking.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-3 rounded-lg ${
                      jogadorRanking.id === jogador.id ? "bg-yellow-100 border-2 border-yellow-400" : "bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center font-bold">{index + 1}</div>
                    <Avatar className="h-10 w-10 mx-2">
                      <AvatarImage src={jogadorRanking.avatar} alt={jogadorRanking.nome} />
                      <AvatarFallback>{jogadorRanking.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold">{jogadorRanking.nome}</div>
                      <div className="text-sm text-muted-foreground">Nível {jogadorRanking.nivel}</div>
                    </div>
                    <div className="font-bold text-yellow-500">{jogadorRanking.pontuacao}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 space-y-4">
        <Button onClick={reiniciarJogo} className="w-full py-4 text-lg bg-green-500 hover:bg-green-600">
          Jogar Novamente
        </Button>
        <Button onClick={voltarAoMenu} variant="outline" className="w-full py-4 text-lg">
          Menu Principal
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[url('/math-background.png')] bg-repeat relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70 z-0"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden">
          {!jogoIniciado && !jogoTerminado && renderTelaInicio()}
          {jogoIniciado && !jogoTerminado && renderTelaJogo()}
          {jogoTerminado && renderTelaFimJogo()}
        </Card>
      </div>
    </div>
  )
}

