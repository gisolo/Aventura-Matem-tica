"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useJogo } from "@/components/providers"
import { Trophy, Heart, Home, Volume2, VolumeX, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"

// Tipos para o jogo
type Operacao = "+" | "-" | "*" | "/"
type Dificuldade = "facil" | "medio" | "dificil"

type Questao = {
  id: number
  num1: number
  num2: number
  operacao: Operacao
  respostaCorreta: number
  opcoes: number[]
}

type Balao = {
  id: number
  valor: number
  x: number
  y: number
  cor: string
}

type Flecha = {
  x: number
  y: number
  targetX: number
  targetY: number
  visible: boolean
  hit: boolean
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
    default:
      respostaCorreta = 0
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

// Cores para os balões
const coresBaloes = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-orange-400",
  "bg-teal-400",
]

// Componente principal do jogo
export default function JogoBaloes() {
  const router = useRouter()
  const { usuario, atualizarUsuario } = useJogo()
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const archerRef = useRef<HTMLDivElement>(null)

  // Configurações do jogo
  const [dificuldade, setDificuldade] = useState<Dificuldade>("facil")
  const [tempoQuestao, setTempoQuestao] = useState(20)
  const [totalQuestoes, setTotalQuestoes] = useState(10)

  // Estado do jogador
  const [pontuacao, setPontuacao] = useState(0)
  const [vidas, setVidas] = useState(3)
  const [nivel, setNivel] = useState(1)

  // Estados do jogo
  const [questaoAtual, setQuestaoAtual] = useState<Questao | null>(null)
  const [questaoIndex, setQuestaoIndex] = useState(0)
  const [respostaCorreta, setRespostaCorreta] = useState<boolean | null>(null)
  const [tempo, setTempo] = useState(tempoQuestao)
  const [jogoIniciado, setJogoIniciado] = useState(false)
  const [jogoTerminado, setJogoTerminado] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [somAtivado, setSomAtivado] = useState(true)
  const [baloes, setBaloes] = useState<Balao[]>([])
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "success" | "error" | "info" } | null>(null)
  const [flecha, setFlecha] = useState<Flecha | null>(null)
  const [archerPosition, setArcherPosition] = useState(50) // Posição do arqueiro em porcentagem
  const [podeAtirar, setPodeAtirar] = useState(true)
  const [baloesEstaoVisiveis, setBaloesEstaoVisiveis] = useState(false)

  // Carregar configurações do usuário
  useEffect(() => {
    if (usuario) {
      if (usuario.dificuldade) {
        setDificuldade(usuario.dificuldade as Dificuldade)
      }

      // Ajustar tempo e número de questões com base na dificuldade
      if (usuario.dificuldade === "facil") {
        setTempoQuestao(20)
        setTotalQuestoes(8)
      } else if (usuario.dificuldade === "medio") {
        setTempoQuestao(15)
        setTotalQuestoes(10)
      } else if (usuario.dificuldade === "dificil") {
        setTempoQuestao(12)
        setTotalQuestoes(12)
      }
    }
  }, [usuario])

  // Iniciar o jogo
  useEffect(() => {
    if (!jogoIniciado && !jogoTerminado) {
      setJogoIniciado(true)
    }
  }, [jogoIniciado, jogoTerminado])

  // Gerar primeira questão ao iniciar
  useEffect(() => {
    if (jogoIniciado && !jogoTerminado && !pausado && !questaoAtual) {
      const novaQuestao = gerarQuestao(1, dificuldade)
      setQuestaoAtual(novaQuestao)
      setTempo(tempoQuestao)
      gerarBaloes(novaQuestao.opcoes)

      // Definir um pequeno atraso para garantir que os balões sejam renderizados
      setTimeout(() => {
        setBaloesEstaoVisiveis(true)
      }, 500)
    }
  }, [jogoIniciado, jogoTerminado, pausado, questaoAtual, dificuldade, tempoQuestao])

  // Timer para contagem regressiva
  useEffect(() => {
    if (jogoIniciado && !jogoTerminado && !pausado && questaoAtual) {
      const timer = setInterval(() => {
        setTempo((tempoAnterior) => {
          if (tempoAnterior <= 1) {
            clearInterval(timer)
            // Tempo esgotado, considerar como resposta errada
            handleRespostaErrada()
            return 0
          }
          return tempoAnterior - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [jogoIniciado, jogoTerminado, pausado, questaoAtual])

  // Função para gerar balões
  const gerarBaloes = (opcoes: number[]) => {
    if (!gameAreaRef.current) return

    const containerWidth = gameAreaRef.current.clientWidth

    // Garantir que temos exatamente 4 opções
    const opcoesExatas = opcoes.slice(0, 4)
    while (opcoesExatas.length < 4) {
      opcoesExatas.push(Math.floor(Math.random() * 100))
    }

    // Distribuir os balões uniformemente no topo da área de jogo
    const novosBaloes = opcoesExatas.map((valor, index) => {
      // Calcular posição X para distribuir uniformemente
      const spacing = containerWidth / 5
      const x = spacing * (index + 1)

      return {
        id: index,
        valor,
        x,
        y: 80, // Posição Y fixa no topo
        cor: coresBaloes[index % coresBaloes.length],
      }
    })

    setBaloes(novosBaloes)
    setBaloesEstaoVisiveis(false) // Inicialmente ocultos, serão mostrados após um delay
  }

  // Função para mover o arqueiro
  const moverArqueiro = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && podeAtirar && !pausado) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentX = (x / rect.width) * 100

      // Limitar a posição dentro dos limites da área de jogo
      const posicaoLimitada = Math.max(10, Math.min(90, percentX))
      setArcherPosition(posicaoLimitada)
    }
  }

  // Função para atirar a flecha
  const atirarFlecha = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!podeAtirar || pausado || !gameAreaRef.current || !archerRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const archerRect = archerRef.current.getBoundingClientRect()

    // Posição inicial da flecha (centro do arqueiro)
    const startX = archerRect.left + archerRect.width / 2 - rect.left
    const startY = archerRect.top - rect.top

    // Posição alvo (onde o usuário clicou)
    const targetX = e.clientX - rect.left
    const targetY = e.clientY - rect.top

    // Criar a flecha
    setFlecha({
      x: startX,
      y: startY,
      targetX,
      targetY,
      visible: true,
      hit: false,
    })

    // Impedir que o jogador atire novamente até que a flecha termine sua trajetória
    setPodeAtirar(false)

    // Verificar colisão com balões após um pequeno delay para a animação
    setTimeout(() => {
      verificarColisao(targetX, targetY)
    }, 300)
  }

  // Função para verificar colisão da flecha com os balões
  const verificarColisao = (x: number, y: number) => {
    // Verificar cada balão
    for (const balao of baloes) {
      // Calcular distância entre o ponto de impacto da flecha e o centro do balão
      const distancia = Math.sqrt(Math.pow(x - balao.x, 2) + Math.pow(y - balao.y, 2))

      // Se a distância for menor que o raio do balão (considerando 50px de raio), houve colisão
      if (distancia < 50) {
        // Atualizar estado da flecha para mostrar acerto
        setFlecha((prev) => (prev ? { ...prev, hit: true } : null))

        // Verificar se a resposta está correta
        verificarResposta(balao.valor)
        return
      }
    }

    // Se não acertou nenhum balão
    setTimeout(() => {
      setFlecha(null)
      setPodeAtirar(true)
    }, 500)
  }

  // Função para verificar resposta
  const verificarResposta = (resposta: number) => {
    if (questaoAtual && !pausado) {
      const estaCorreto = resposta === questaoAtual.respostaCorreta
      setRespostaCorreta(estaCorreto)

      if (estaCorreto) {
        handleRespostaCorreta()
      } else {
        handleRespostaErrada()
      }
    }
  }

  // Função para lidar com resposta correta
  const handleRespostaCorreta = () => {
    // Calcular pontos
    const pontosPorQuestao = dificuldade === "facil" ? 10 : dificuldade === "medio" ? 20 : 30
    const bonusTempo = Math.floor(tempo * 0.5) // Bônus pelo tempo restante
    const pontos = pontosPorQuestao + bonusTempo

    // Atualizar pontuação
    setPontuacao((prev) => prev + pontos)

    // Mostrar mensagem
    setMensagem({
      texto: `Correto! +${pontos} pontos`,
      tipo: "success",
    })

    // Aguardar um pouco antes de passar para a próxima questão
    setTimeout(() => {
      setFlecha(null)
      setPodeAtirar(true)
      proximaQuestao()
    }, 1500)
  }

  // Função para lidar com resposta errada
  const handleRespostaErrada = () => {
    // Perder vida
    setVidas((prev) => prev - 1)

    // Mostrar mensagem
    setMensagem({
      texto: `Incorreto! A resposta era ${questaoAtual?.respostaCorreta}`,
      tipo: "error",
    })

    // Verificar se acabaram as vidas
    if (vidas <= 1) {
      setTimeout(() => {
        setFlecha(null)
        finalizarJogo()
      }, 1500)
    } else {
      // Aguardar um pouco antes de passar para a próxima questão
      setTimeout(() => {
        setFlecha(null)
        setPodeAtirar(true)
        proximaQuestao()
      }, 1500)
    }
  }

  // Função para passar para a próxima questão
  const proximaQuestao = () => {
    setMensagem(null)

    if (questaoIndex + 1 >= totalQuestoes) {
      // Fim de jogo se atingiu o total de questões
      finalizarJogo()
    } else {
      // Próxima questão
      const proximoIndex = questaoIndex + 1
      const novaQuestao = gerarQuestao(proximoIndex + 1, dificuldade)
      setQuestaoIndex(proximoIndex)
      setQuestaoAtual(novaQuestao)
      setTempo(tempoQuestao)
      setRespostaCorreta(null)
      gerarBaloes(novaQuestao.opcoes)

      // Definir um pequeno atraso para garantir que os balões sejam renderizados
      setTimeout(() => {
        setBaloesEstaoVisiveis(true)
      }, 500)
    }
  }

  // Função para finalizar o jogo
  const finalizarJogo = () => {
    setJogoTerminado(true)

    // Salvar pontuação no perfil do usuário
    if (usuario) {
      const pontuacaoAnterior = usuario.pontuacao || 0
      const melhorPontuacao = Math.max(pontuacaoAnterior, pontuacao)

      atualizarUsuario({
        pontuacao: melhorPontuacao,
        nivel: Math.floor(melhorPontuacao / 100) + 1,
      })
    }
  }

  // Função para reiniciar o jogo
  const reiniciarJogo = () => {
    setJogoIniciado(true)
    setJogoTerminado(false)
    setQuestaoIndex(0)
    setPontuacao(0)
    setVidas(3)
    setQuestaoAtual(null)
    setBaloes([])
    setMensagem(null)
    setFlecha(null)
    setPodeAtirar(true)
  }

  // Função para voltar ao menu
  const voltarAoMenu = () => {
    router.push("/menu")
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
      default:
        return ""
    }
  }

  // Renderizar tela de jogo
  const renderTelaJogo = () => (
    <div className="p-4 h-full flex flex-col">
      {/* Cabeçalho com informações do jogador */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 border-2 border-yellow-400">
            <AvatarImage src={usuario?.avatar || "/avatares/menino-matematica.png"} alt={usuario?.nome || "Jogador"} />
            <AvatarFallback>{usuario?.nome?.charAt(0) || "J"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold">{usuario?.nome || "Jogador"}</div>
            <div className="text-sm text-muted-foreground">Nível {nivel}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>{pontuacao}</span>
          </Badge>

          <div className="flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`h-6 w-6 ${i < vidas ? "text-red-500 fill-red-500" : "text-gray-300"}`} />
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={() => setPausado(!pausado)}>
            {pausado ? <span className="font-bold">▶</span> : <span className="font-bold">II</span>}
          </Button>
        </div>
      </div>

      {/* Barra de progresso do tempo */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Tempo restante</span>
          <span>{tempo}s</span>
        </div>
        <Progress value={(tempo / tempoQuestao) * 100} className="h-2" />
      </div>

      {/* Progresso do jogo */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progresso</span>
          <span>
            {questaoIndex + 1} de {totalQuestoes}
          </span>
        </div>
        <Progress
          value={((questaoIndex + 1) / totalQuestoes) * 100}
          className="h-2 bg-blue-200"
          indicatorClassName="bg-blue-500"
        />
      </div>

      {/* Questão atual */}
      {questaoAtual && (
        <div className="mb-4">
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

      {/* Mensagem de feedback */}
      <AnimatePresence>
        {mensagem && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center p-2 rounded-lg mb-4 font-bold text-lg ${
              mensagem.tipo === "success"
                ? "bg-green-100 text-green-700"
                : mensagem.tipo === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {mensagem.tipo === "success" && <CheckCircle2 className="inline mr-2 h-5 w-5" />}
            {mensagem.tipo === "error" && <XCircle className="inline mr-2 h-5 w-5" />}
            {mensagem.texto}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área de jogo com balões e arqueiro */}
      <div
        ref={gameAreaRef}
        className="flex-1 relative overflow-hidden bg-blue-50 rounded-xl border-2 border-blue-200 cursor-crosshair"
        onMouseMove={moverArqueiro}
        onClick={atirarFlecha}
      >
        {/* Balões */}
        <AnimatePresence>
          {baloesEstaoVisiveis &&
            baloes.map((balao) => (
              <motion.div
                key={balao.id}
                className={`absolute ${balao.cor} rounded-full w-[100px] h-[100px] flex items-center justify-center`}
                style={{
                  left: `${balao.x - 50}px`,
                  top: `${balao.y - 50}px`,
                }}
                initial={{ y: -150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -150, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Cordinha do balão */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-1 h-16 bg-gray-400"></div>

                {/* Número dentro do balão */}
                <span className="text-white font-bold text-2xl drop-shadow-md">{balao.valor}</span>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Flecha em movimento */}
        {flecha && flecha.visible && (
          <motion.div
            className="absolute w-6 h-1 bg-brown-500 origin-center z-10"
            style={{
              left: `${flecha.x}px`,
              top: `${flecha.y}px`,
              transformOrigin: "center",
            }}
            initial={{
              x: 0,
              y: 0,
              rotate: Math.atan2(flecha.targetY - flecha.y, flecha.targetX - flecha.x) * (180 / Math.PI),
            }}
            animate={{
              x: flecha.targetX - flecha.x,
              y: flecha.targetY - flecha.y,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Ponta da flecha */}
            <div
              className="absolute right-0 transform translate-x-1/2 -translate-y-1/2 w-0 h-0 
                          border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-gray-800"
            ></div>
          </motion.div>
        )}

        {/* Arqueiro (arco e flecha) */}
        <div
          ref={archerRef}
          className="absolute bottom-4 transform -translate-x-1/2"
          style={{ left: `${archerPosition}%` }}
        >
          <div className="relative">
            {/* Arco */}
            <div className="w-12 h-20 border-4 border-yellow-800 border-r-0 rounded-l-full flex items-center justify-center">
              {/* Corda do arco */}
              <div className="absolute right-0 top-0 bottom-0 w-0.5 h-full bg-gray-600"></div>

              {/* Personagem */}
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full -mt-1 -ml-1"></div>
                  <div className="w-1 h-1 bg-black rounded-full -mt-1 ml-1"></div>
                  <div className="w-2 h-0.5 bg-black rounded-full mt-1"></div>
                </div>
              </div>
            </div>

            {/* Flecha pronta para ser disparada (visível apenas quando pode atirar) */}
            {podeAtirar && (
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-8 h-1 bg-brown-500">
                <div
                  className="absolute right-0 transform translate-x-1/2 -translate-y-1/2 w-0 h-0 
                              border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-gray-800"
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-gray-500 text-sm bg-white/70 px-2 py-1 rounded">
          Mova o mouse e clique para atirar nos balões com a resposta correta!
        </div>
      </div>

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
              <Button onClick={() => setPausado(false)} className="w-full py-4 text-lg bg-green-500 hover:bg-green-600">
                className="w-full py-4 text-lg bg-green-500 hover:bg-green-600"> Continuar
              </Button>
              <Button onClick={() => setSomAtivado(!somAtivado)} variant="outline" className="w-full py-4 text-lg">
                {somAtivado ? <Volume2 className="mr-2 h-5 w-5" /> : <VolumeX className="mr-2 h-5 w-5" />}
                {somAtivado ? "Som: Ligado" : "Som: Desligado"}
              </Button>
              <Button onClick={voltarAoMenu} variant="outline" className="w-full py-4 text-lg">
                {" "}
                (
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
          Sua pontuação: <span className="font-bold text-yellow-500">{pontuacao}</span>
        </p>
      </motion.div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-yellow-400">
              <AvatarImage
                src={usuario?.avatar || "/avatares/menino-matematica.png"}
                alt={usuario?.nome || "Jogador"}
              />
              <AvatarFallback>{usuario?.nome?.charAt(0) || "J"}</AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Pontuação</div>
              <div className="text-2xl font-bold">{pontuacao}</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Nível</div>
              <div className="text-2xl font-bold">{nivel}</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Questões</div>
              <div className="text-2xl font-bold">
                {questaoIndex + 1}/{totalQuestoes}
              </div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Vidas Restantes</div>
              <div className="text-2xl font-bold">{vidas}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        <Button onClick={reiniciarJogo} className="w-full py-4 text-lg bg-green-500 hover:bg-green-600">
          Jogar Novamente
        </Button>
        <Button onClick={voltarAoMenu} variant="outline" className="w-full py-4 text-lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Menu Principal
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[url('/math-background.png')] bg-repeat relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70 z-0"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl h-[80vh] shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden">
          {jogoIniciado && !jogoTerminado && renderTelaJogo()}
          {jogoTerminado && renderTelaFimJogo()}
        </Card>
      </div>
    </div>
  )
}

