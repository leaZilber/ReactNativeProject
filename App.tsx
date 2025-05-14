"use client"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import AuthNavigator from "./navigation/AuthNavigator"
import MainNavigator from "./navigation/MainNavigator"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { SugarProvider } from "./contexts/SugarContext"

const Stack = createStackNavigator()

const AppContent = () => {
  const { isAuthenticated } = useAuth()

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SugarProvider>
          <AppContent />
        </SugarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
