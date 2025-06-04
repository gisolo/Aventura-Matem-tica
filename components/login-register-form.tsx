"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, User, Lock, UserPlus, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useJogo } from "./providers"

// Esquema de validação para o formulário de login
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "O nome de usuário deve ter pelo menos 3 caracteres.",
  }),
  password: z.string().min(4, {
    message: "A senha deve ter pelo menos 4 caracteres.",
  }),
})

// Esquema de validação para o formulário de registro
const registerSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  age: z.coerce
    .number()
    .min(5, {
      message: "A idade mínima é 5 anos.",
    })
    .max(12, {
      message: "A idade máxima é 12 anos.",
    }),
  username: z.string().min(3, {
    message: "O nome de usuário deve ter pelo menos 3 caracteres.",
  }),
  password: z.string().min(4, {
    message: "A senha deve ter pelo menos 4 caracteres.",
  }),
})

// Componente de personagem animado
const MathCharacter = ({ emotion = "happy" }) => {
  return (
    <motion.div
      className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.7 }}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-yellow-400 rounded-full overflow-hidden border-4 border-yellow-500">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 flex justify-center items-center">
            {emotion === "happy" ? (
              <>
                <div className="absolute top-1/4 left-1/4 w-1/5 h-1/5 bg-black rounded-full"></div>
                <div className="absolute top-1/4 right-1/4 w-1/5 h-1/5 bg-black rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-1/2 h-1/5 bg-black rounded-full"></div>
              </>
            ) : (
              <>
                <div className="absolute top-1/4 left-1/4 w-1/5 h-1/5 bg-black rounded-full"></div>
                <div className="absolute top-1/4 right-1/4 w-1/5 h-1/5 bg-black rounded-full"></div>
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-1/2 h-1/5 bg-black rounded-full rotate-180"></div>
              </>
            )}
          </div>
        </div>
        <motion.div
          className="absolute -bottom-2 -right-2 text-4xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          🧮
        </motion.div>
      </div>
    </motion.div>
  )
}

// Componente de confete para celebração
const Confetti = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
            top: `-10%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: ["0vh", "100vh"],
            x: [`${Math.random() * 10 - 5}%`, `${Math.random() * 20 - 10}%`],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

export default function LoginRegisterForm() {
  const router = useRouter()
  const { login, registrar, estaLogado } = useJogo()
  const [activeTab, setActiveTab] = useState("login")
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [characterEmotion, setCharacterEmotion] = useState("happy")

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (estaLogado) {
      router.push("/menu")
    }
  }, [estaLogado, router])

  // Formulário de login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // Formulário de registro
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      age: undefined,
      username: "",
      password: "",
    },
  })

  // Efeito para mostrar confetes quando o alerta de sucesso é exibido
  useEffect(() => {
    if (alert?.type === "success") {
      setShowConfetti(true)
      setCharacterEmotion("happy")
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else if (alert?.type === "error") {
      setCharacterEmotion("sad")
    }
  }, [alert])

  // Função para lidar com o envio do formulário de login
  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    const sucesso = await login(values.username, values.password)

    if (sucesso) {
      setAlert({
        type: "success",
        message: "Uhuuul! Você entrou no mundo da matemática! 🎉",
      })

      // Redirecionar após login bem-sucedido
      setTimeout(() => {
        router.push("/menu")
      }, 1500)
    } else {
      setAlert({
        type: "error",
        message: "Ops! Nome de usuário ou senha incorretos.",
      })

      setTimeout(() => {
        setAlert(null)
      }, 3000)
    }
  }

  // Função para lidar com o envio do formulário de registro
  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    const sucesso = await registrar(values.name, values.age, values.username, values.password)

    if (sucesso) {
      setAlert({
        type: "success",
        message: "Bem-vindo(a) à turma da matemática! Agora você pode entrar e se divertir! 🎮",
      })

      // Limpar o formulário e redirecionar após registro bem-sucedido
      setTimeout(() => {
        router.push("/menu")
      }, 1500)
    } else {
      setAlert({
        type: "error",
        message: "Ops! Este nome de usuário já está sendo usado. Tente outro.",
      })

      setTimeout(() => {
        setAlert(null)
      }, 3000)
    }
  }

  return (
    <div className="relative">
      <MathCharacter emotion={characterEmotion} />
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-4 border-yellow-400 overflow-hidden bg-white relative">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-red-500 rounded-full flex items-end justify-start p-2 transform rotate-12">
            <span className="text-white font-bold text-xs">DIVERSÃO MATEMÁTICA!</span>
          </div>

          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg py-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                >
                  {["+", "-", "×", "÷", "="][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>

            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">Aventura Matemática</CardTitle>
            <CardDescription className="text-primary-foreground text-lg">
              Embarque nessa jornada de números e diversão!
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full rounded-none bg-blue-100">
              <TabsTrigger
                value="login"
                className="text-lg py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <User className="mr-2 h-5 w-5" />
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-lg py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Novo Jogador
              </TabsTrigger>
            </TabsList>

            {alert && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <Alert
                  variant={alert.type === "success" ? "default" : "destructive"}
                  className="mx-6 mt-4 border-4 border-dashed"
                >
                  {alert.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <AlertTitle className="text-lg">{alert.type === "success" ? "Incrível!" : "Opa!"}</AlertTitle>
                  <AlertDescription className="text-base">{alert.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <TabsContent value="login" className="p-0">
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Nome de Aventureiro
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome de aventureiro"
                              {...field}
                              className="text-lg p-6 rounded-xl border-2 border-blue-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center">
                            <Lock className="mr-2 h-5 w-5" />
                            Senha Secreta
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite sua senha secreta"
                              {...field}
                              className="text-lg p-6 rounded-xl border-2 border-blue-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                      size="lg"
                    >
                      Iniciar Aventura! 🚀
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register" className="p-0">
              <CardContent className="pt-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Nome do Explorador
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Como você se chama?"
                              {...field}
                              className="text-lg p-6 rounded-xl border-2 border-orange-300 focus:border-orange-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Quantos Anos Você Tem?
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Sua idade"
                              {...field}
                              className="text-lg p-6 rounded-xl border-2 border-orange-300 focus:border-orange-500"
                            />
                          </FormControl>
                          <FormDescription className="text-base">
                            Vamos escolher desafios perfeitos para sua idade! 🧩
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Nome de Aventureiro
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Escolha um nome legal para jogar"
                              {...field}
                              className="text-lg p-6 rounded-xl border-2 border-orange-300 focus:border-orange-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center">
                            <Lock className="mr-2 h-5 w-5" />
                            Senha Secreta
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Crie uma senha secreta"
                              {...field}
                              className="text-lg p-6 rounded-xl border-2 border-orange-300 focus:border-orange-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                      size="lg"
                    >
                      Criar Meu Personagem! 🧙‍♂️
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-center bg-blue-100 py-4">
            <div className="flex items-center space-x-2">
              {["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"].map((emoji, index) => (
                <motion.span
                  key={index}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1,
                    delay: index * 0.2,
                  }}
                  className="text-xl"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

