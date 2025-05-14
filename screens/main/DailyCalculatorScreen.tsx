"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useSugar, type FoodItem } from "../../contexts/SugarContext"
import { useAuth } from "../../contexts/AuthContext"
import SugarLevelIndicator from "../../components/SugarLevelIndicator"

const DailyCalculatorScreen = () => {
  const { user } = useAuth()
  const { foodDatabase, addEntry, dailyLimit } = useSugar()
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodSugar, setNewFoodSugar] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalSugar, setTotalSugar] = useState(0)

  // Filter foods based on search query
  const filteredFoods = foodDatabase.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Calculate total sugar whenever selected foods change
  useEffect(() => {
    const total = selectedFoods.reduce((sum, food) => sum + food.sugarContent, 0)
    setTotalSugar(total)
  }, [selectedFoods])

  const handleAddFood = (food: FoodItem) => {
    setSelectedFoods([...selectedFoods, food])
  }

  const handleRemoveFood = (index: number) => {
    const newSelectedFoods = [...selectedFoods]
    newSelectedFoods.splice(index, 1)
    setSelectedFoods(newSelectedFoods)
  }

  const handleSubmitEntry = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert("Error", "Please add at least one food item")
      return
    }

    setIsSubmitting(true)
    try {
      await addEntry(selectedFoods)
      Alert.alert("Success", "Your sugar intake has been recorded")
      setSelectedFoods([])
    } catch (error) {
      Alert.alert("Error", "Failed to save your entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCustomFood = () => {
    if (!newFoodName || !newFoodSugar) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    const sugarContent = Number.parseFloat(newFoodSugar)
    if (isNaN(sugarContent)) {
      Alert.alert("Error", "Sugar content must be a number")
      return
    }

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: newFoodName,
      sugarContent,
      isHealthy: sugarContent <= 5, 
    }

    handleAddFood(newFood)
    setModalVisible(false)
    setNewFoodName("")
    setNewFoodSugar("")
  }

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={[styles.foodItem, { backgroundColor: item.isHealthy ? "#E8F5E9" : "#FFEBEE" }]}
      onPress={() => handleAddFood(item)}
    >
      <View style={styles.foodItemContent}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodSugar}>{item.sugarContent}g sugar</Text>
      </View>
      <View style={[styles.healthIndicator, { backgroundColor: item.isHealthy ? "#4CAF50" : "#F44336" }]}>
        <Ionicons name={item.isHealthy ? "checkmark" : "close"} size={16} color="#fff" />
      </View>
    </TouchableOpacity>
  )

  const renderSelectedFoodItem = ({ item, index }: { item: FoodItem; index: number }) => (
    <View style={[styles.selectedFoodItem, { backgroundColor: item.isHealthy ? "#E8F5E9" : "#FFEBEE" }]}>
      <View style={styles.foodItemContent}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodSugar}>{item.sugarContent}g sugar</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFood(index)}>
        <Ionicons name="trash-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Sugar Calculator</Text>
        <Text style={styles.welcomeText}>Hello, {user?.username || "User"}!</Text>
      </View>

      <View style={styles.sugarSummary}>
        <Text style={styles.summaryTitle}>Today's Sugar Intake</Text>
        <SugarLevelIndicator current={totalSugar} limit={dailyLimit} />
        <Text style={styles.limitText}>
          Daily Limit: {dailyLimit}g | Current: {totalSugar.toFixed(1)}g
        </Text>
      </View>

      <View style={styles.selectedFoodsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Selected Foods</Text>
          <TouchableOpacity style={styles.customFoodButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.customFoodButtonText}>+ Custom Food</Text>
          </TouchableOpacity>
        </View>

        {selectedFoods.length > 0 ? (
          <FlatList
            data={selectedFoods}
            renderItem={renderSelectedFoodItem}
            keyExtractor={(item, index) => `selected-${item.id}-${index}`}
            style={styles.selectedFoodsList}
          />
        ) : (
          <View style={styles.emptySelectedFoods}>
            <Ionicons name="restaurant-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Add foods to calculate your sugar intake</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, selectedFoods.length === 0 && styles.disabledButton]}
          onPress={handleSubmitEntry}
          disabled={selectedFoods.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Today's Intake</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.foodDatabaseContainer}>
        <Text style={styles.sectionTitle}>Food Database</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredFoods}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          style={styles.foodList}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Food</Text>

            <Text style={styles.modalLabel}>Food Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter food name"
              value={newFoodName}
              onChangeText={setNewFoodName}
            />

            <Text style={styles.modalLabel}>Sugar Content (grams)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter sugar content"
              value={newFoodSugar}
              onChangeText={setNewFoodSugar}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.addButton]} onPress={handleAddCustomFood}>
                <Text style={styles.addButtonText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#4CAF50",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: "#E8F5E9",
  },
  sugarSummary: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  limitText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  selectedFoodsContainer: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: "30%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  customFoodButton: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  customFoodButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  selectedFoodsList: {
    maxHeight: 150,
  },
  emptySelectedFoods: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
  selectedFoodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  removeButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  foodDatabaseContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "500",
  },
  foodSugar: {
    fontSize: 14,
    color: "#666",
  },
  healthIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  modalInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})

export default DailyCalculatorScreen
