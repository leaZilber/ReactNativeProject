"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

type User = {
  id: string
  username: string
  email: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error("Error checking login status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkLoginStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const mockUser = {
        id: "1",
        username: email.split("@")[0],
        email,
      }

      await AsyncStorage.setItem("user", JSON.stringify(mockUser))
      setUser(mockUser)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
      }

      await AsyncStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
