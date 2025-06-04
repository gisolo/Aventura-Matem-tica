"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

// Tipo para o usuário
type Usuario = {
  id: string
  nome: string
  idade: number
  username: string
  avatar?: string
  dificuldade?: string
  modoJogo?: string
}

// Tipo para o contexto
type ContextoJogo = {
  usuario: Usuario | null
  estaLogado: boolean
  login: (username: string, password: string) => Promise<boolean>
  registrar: (nome: string, idade: number, username: string, password: string) => Promise<boolean>
  logout: () => void
  atualizarUsuario: (dados: Partial<Usuario>) => void
}

// Criar o contexto
const JogoContext = createContext<ContextoJogo | undefined>(undefined)

// Hook para usar o contexto
export function useJogo() {
  const context = useContext(JogoContext)
  if (context === undefined) {
    throw new Error("useJogo deve ser usado dentro de um JogoProvider")
  }
  return context
}

// Componente Provider
export function Providers({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [estaLogado, setEstaLogado] = useState(false)

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario")
    if (usuarioSalvo) {
      try {
        const dadosUsuario = JSON.parse(usuarioSalvo)
        setUsuario(dadosUsuario)
        setEstaLogado(true)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("usuario")
      }
    }
  }, [])

  // Função de login
  const login = async (username: string, password: string): Promise<boolean> => {
    // Verificar se o usuário existe no localStorage
    const usuariosSalvos = localStorage.getItem("usuarios")
    if (usuariosSalvos) {
      try {
        const usuarios = JSON.parse(usuariosSalvos)
        const usuarioEncontrado = usuarios.find((u: any) => u.username === username && u.password === password)

        if (usuarioEncontrado) {
          // Remover a senha antes de salvar no estado
          const { password: _, ...usuarioSemSenha } = usuarioEncontrado
          setUsuario(usuarioSemSenha)
          setEstaLogado(true)
          localStorage.setItem("usuario", JSON.stringify(usuarioSemSenha))
          return true
        }
      } catch (error) {
        console.error("Erro ao fazer login:", error)
      }
    }
    return false
  }

  // Função de registro
  const registrar = async (nome: string, idade: number, username: string, password: string): Promise<boolean> => {
    // Verificar se o username já existe
    const usuariosSalvos = localStorage.getItem("usuarios")
    let usuarios = []

    if (usuariosSalvos) {
      try {
        usuarios = JSON.parse(usuariosSalvos)
        const usernameExiste = usuarios.some((u: any) => u.username === username)

        if (usernameExiste) {
          return false // Username já existe
        }
      } catch (error) {
        console.error("Erro ao verificar usuários existentes:", error)
      }
    }

    // Criar novo usuário
    const novoUsuario = {
      id: Date.now().toString(),
      nome,
      idade,
      username,
      password, // Nota: Em uma aplicação real, nunca armazene senhas em texto puro
    }

    // Adicionar à lista de usuários
    usuarios.push(novoUsuario)
    localStorage.setItem("usuarios", JSON.stringify(usuarios))

    // Fazer login automaticamente
    const { password: _, ...usuarioSemSenha } = novoUsuario
    setUsuario(usuarioSemSenha)
    setEstaLogado(true)
    localStorage.setItem("usuario", JSON.stringify(usuarioSemSenha))

    return true
  }

  // Função de logout
  const logout = () => {
    setUsuario(null)
    setEstaLogado(false)
    localStorage.removeItem("usuario")
  }

  // Função para atualizar dados do usuário
  const atualizarUsuario = (dados: Partial<Usuario>) => {
    if (usuario) {
      const usuarioAtualizado = { ...usuario, ...dados }
      setUsuario(usuarioAtualizado)
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado))

      // Atualizar também na lista de usuários
      const usuariosSalvos = localStorage.getItem("usuarios")
      if (usuariosSalvos) {
        try {
          const usuarios = JSON.parse(usuariosSalvos)
          const index = usuarios.findIndex((u: any) => u.id === usuario.id)
          if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...dados }
            localStorage.setItem("usuarios", JSON.stringify(usuarios))
          }
        } catch (error) {
          console.error("Erro ao atualizar usuário na lista:", error)
        }
      }
    }
  }

  const value = {
    usuario,
    estaLogado,
    login,
    registrar,
    logout,
    atualizarUsuario,
  }

  return <JogoContext.Provider value={value}>{children}</JogoContext.Provider>
}

