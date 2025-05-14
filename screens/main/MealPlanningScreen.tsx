"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useSugar, type FoodItem } from "../../contexts/SugarContext"
import SugarLevelIndicator from "../../components/SugarLevelIndicator"

const MealPlanningScreen = () => {
  const { foodDatabase, dailyLimit, addMealPlan } = useSugar()
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [totalSugar, setTotalSugar] = useState(0)
  const [mealName, setMealName] = useState("")
  const [showHealthyOnly, setShowHealthyOnly] = useState(false)
  const [savingMeal, setSavingMeal] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const filteredFoods = foodDatabase.filter(
    (food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()) && (showHealthyOnly ? food.isHealthy : true),
  )

  useEffect(() => {
    const total = selectedFoods.reduce((sum, food) => sum + food.sugarContent, 0)
    setTotalSugar(total)
  }, [selectedFoods])

  const handleAddFood = (food: FoodItem) => {
    if (!food.isHealthy && totalSugar + food.sugarContent > dailyLimit) {
      Alert.alert(
        "Warning",
        "Adding this unhealthy food would exceed your daily sugar limit. Consider a healthier alternative.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Anyway",
            style: "destructive",
            onPress: () => {
              setSelectedFoods([...selectedFoods, food])
            },
          },
        ],
      )
    } else {
      setSelectedFoods([...selectedFoods, food])
    }
  }

  const handleRemoveFood = (index: number) => {
    const newSelectedFoods = [...selectedFoods]
    newSelectedFoods.splice(index, 1)
    setSelectedFoods(newSelectedFoods)
  }

  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert("Error", "Please add at least one food item to your meal")
      return
    }

    if (!mealName.trim()) {
      Alert.alert("Error", "Please enter a name for your meal plan")
      return
    }

    setSavingMeal(true)
    try {
      await addMealPlan({
        id: "",
        name: mealName,
        foods: selectedFoods,
        totalSugar,
        date: "",
      })
      Alert.alert("Success", "Your meal plan has been saved")
      setSelectedFoods([])
      setMealName("")
    } catch (error) {
      Alert.alert("Error", "Failed to save your meal plan")
    } finally {
      setSavingMeal(false)
    }
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
        <Text style={styles.headerTitle}>Healthy Meal Planning</Text>
        <TouchableOpacity style={styles.infoButton} onPress={() => setInfoModalVisible(true)}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.mealPlanContainer}>
        <Text style={styles.sectionTitle}>Create Your Meal Plan</Text>
        <TextInput
          style={styles.mealNameInput}
          placeholder="Enter meal plan name..."
          value={mealName}
          onChangeText={setMealName}
        />

        <View style={styles.sugarSummary}>
          <SugarLevelIndicator current={totalSugar} limit={dailyLimit} />
          <Text style={styles.limitText}>
            {totalSugar.toFixed(1)}g of {dailyLimit}g daily limit
          </Text>
        </View>

        <Text style={styles.selectedFoodsTitle}>Selected Foods</Text>
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
            <Text style={styles.emptyText}>Add foods to create your healthy meal</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            (selectedFoods.length === 0 || !mealName.trim() || savingMeal) && styles.disabledButton,
          ]}
          onPress={handleSaveMeal}
          disabled={selectedFoods.length === 0 || !mealName.trim() || savingMeal}
        >
          {savingMeal ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Meal Plan</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.foodDatabaseContainer}>
        <View style={styles.foodDatabaseHeader}>
          <Text style={styles.sectionTitle}>Food Database</Text>
          <TouchableOpacity
            style={[styles.filterButton, showHealthyOnly && styles.filterButtonActive]}
            onPress={() => setShowHealthyOnly(!showHealthyOnly)}
          >
            <Text style={[styles.filterButtonText, showHealthyOnly && styles.filterButtonTextActive]}>
              {showHealthyOnly ? "Showing Healthy" : "Show Healthy Only"}
            </Text>
          </TouchableOpacity>
        </View>

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

      {/* Information Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Healthy Eating Guide</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setInfoModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.infoTitle}>Sugar Recommendations</Text>
              <Text style={styles.infoText}>
                The World Health Organization recommends limiting added sugar intake to less than 25 grams (6 teaspoons)
                per day for optimal health benefits.
              </Text>

              <Text style={styles.infoTitle}>Food Label Guide</Text>
              <View style={styles.labelGuide}>
                <View style={styles.labelItem}>
                  <View style={[styles.labelColor, { backgroundColor: "#4CAF50" }]} />
                  <Text style={styles.labelText}>Green: Healthy choice, low in sugar</Text>
                </View>
                <View style={styles.labelItem}>
                  <View style={[styles.labelColor, { backgroundColor: "#FF9800" }]} />
                  <Text style={styles.labelText}>Orange: Caution, moderate sugar content</Text>
                </View>
                <View style={styles.labelItem}>
                  <View style={[styles.labelColor, { backgroundColor: "#F44336" }]} />
                  <Text style={styles.labelText}>Red: High sugar content, consume sparingly</Text>
                </View>
              </View>

              <Text style={styles.infoTitle}>Tips for Reducing Sugar</Text>
              <Text style={styles.infoText}>
                • Choose fresh fruits instead of fruit juices{"\n"}• Read food labels carefully{"\n"}• Avoid sugary
                drinks and sodas{"\n"}• Choose plain yogurt and add fresh fruit{"\n"}• Gradually reduce sugar in recipes
                {"\n"}• Be aware of hidden sugars in processed foods
              </Text>
            </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#4CAF50",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  infoButton: {
    padding: 5,
  },
  mealPlanContainer: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: "45%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  mealNameInput: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sugarSummary: {
    marginBottom: 10,
  },
  limitText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  selectedFoodsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
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
  removeButton: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  saveButtonText: {
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
  foodDatabaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterButtonActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  filterButtonText: {
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
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
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalScroll: {
    maxHeight: 400,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  labelGuide: {
    marginTop: 10,
    marginBottom: 15,
  },
  labelItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  labelText: {
    fontSize: 16,
    color: "#333",
  },
})

export default MealPlanningScreen
