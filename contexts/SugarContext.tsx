"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type FoodItem = {
  id: string
  name: string
  sugarContent: number 
  isHealthy: boolean
}

export type SugarEntry = {
  id: string
  date: string
  foods: FoodItem[]
  totalSugar: number
}

export type MealPlan = {
  id: string
  name: string
  foods: FoodItem[]
  totalSugar: number
  date: string
}

type SugarContextType = {
  dailyLimit: number
  setDailyLimit: (limit: number) => void
  entries: SugarEntry[]
  addEntry: (foods: FoodItem[]) => Promise<void>
  foodDatabase: FoodItem[]
  addFoodItem: (food: FoodItem) => Promise<void>
  mealPlans: MealPlan[]
  addMealPlan: (plan: MealPlan) => Promise<void>
  loading: boolean
}

const SugarContext = createContext<SugarContextType>({
  dailyLimit: 25, 
  setDailyLimit: () => {},
  entries: [],
  addEntry: async () => {},
  foodDatabase: [],
  addFoodItem: async () => {},
  mealPlans: [],
  addMealPlan: async () => {},
  loading: true,
})

export const useSugar = () => useContext(SugarContext)

const initialFoodDatabase: FoodItem[] = [
  { id: "1", name: "Apple", sugarContent: 10, isHealthy: true },
  { id: "2", name: "Banana", sugarContent: 14, isHealthy: true },
  { id: "3", name: "Orange", sugarContent: 9, isHealthy: true },
  { id: "4", name: "Chocolate Bar", sugarContent: 24, isHealthy: false },
  { id: "5", name: "Soda (330ml)", sugarContent: 35, isHealthy: false },
  { id: "6", name: "Greek Yogurt", sugarContent: 5, isHealthy: true },
  { id: "7", name: "Ice Cream", sugarContent: 28, isHealthy: false },
  { id: "8", name: "Carrot", sugarContent: 3, isHealthy: true },
  { id: "9", name: "Candy", sugarContent: 20, isHealthy: false },
  { id: "10", name: "Donuts", sugarContent: 25, isHealthy: false },
  { id: "11", name: "Whole Grain Bread", sugarContent: 2, isHealthy: true },
  { id: "12", name: "Sweetened iced tea", sugarContent: 28, isHealthy: false },
  { id: "13", name: "Chocolate bars", sugarContent: 38, isHealthy: false },
  { id: "14", name: "Cupcakes", sugarContent: 50, isHealthy: false }
]

export const SugarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyLimit, setDailyLimit] = useState(25)
  const [entries, setEntries] = useState<SugarEntry[]>([])
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(initialFoodDatabase)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const limitData = await AsyncStorage.getItem("dailyLimit")
        if (limitData) {
          setDailyLimit(Number(limitData))
        }

        const entriesData = await AsyncStorage.getItem("sugarEntries")
        if (entriesData) {
          setEntries(JSON.parse(entriesData))
        }

        const foodData = await AsyncStorage.getItem("foodDatabase")
        if (foodData) {
          setFoodDatabase(JSON.parse(foodData))
        } else {
          await AsyncStorage.setItem("foodDatabase", JSON.stringify(initialFoodDatabase))
        }

        const mealData = await AsyncStorage.getItem("mealPlans")
        if (mealData) {
          setMealPlans(JSON.parse(mealData))
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateDailyLimit = async (limit: number) => {
    try {
      await AsyncStorage.setItem("dailyLimit", limit.toString())
      setDailyLimit(limit)
    } catch (error) {
      console.error("Error updating daily limit:", error)
    }
  }

  const addEntry = async (foods: FoodItem[]) => {
    try {
      const totalSugar = foods.reduce((sum, food) => sum + food.sugarContent, 0)
      const newEntry: SugarEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        foods,
        totalSugar,
      }

      const updatedEntries = [...entries, newEntry]
      await AsyncStorage.setItem("sugarEntries", JSON.stringify(updatedEntries))
      setEntries(updatedEntries)
    } catch (error) {
      console.error("Error adding entry:", error)
    }
  }

  const addFoodItem = async (food: FoodItem) => {
    try {
      const newFood = {
        ...food,
        id: Date.now().toString(),
      }
      const updatedFoods = [...foodDatabase, newFood]
      await AsyncStorage.setItem("foodDatabase", JSON.stringify(updatedFoods))
      setFoodDatabase(updatedFoods)
    } catch (error) {
      console.error("Error adding food item:", error)
    }
  }

  const addMealPlan = async (plan: MealPlan) => {
    try {
      const newPlan = {
        ...plan,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      }
      const updatedPlans = [...mealPlans, newPlan]
      await AsyncStorage.setItem("mealPlans", JSON.stringify(updatedPlans))
      setMealPlans(updatedPlans)
    } catch (error) {
      console.error("Error adding meal plan:", error)
    }
  }

  return (
    <SugarContext.Provider
      value={{
        dailyLimit,
        setDailyLimit: updateDailyLimit,
        entries,
        addEntry,
        foodDatabase,
        addFoodItem,
        mealPlans,
        addMealPlan,
        loading,
      }}
    >
      {children}
    </SugarContext.Provider>
  )
}
