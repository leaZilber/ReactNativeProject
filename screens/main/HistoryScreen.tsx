"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useSugar, type SugarEntry } from "../../contexts/SugarContext"
import SugarLevelIndicator from "../../components/SugarLevelIndicator"

const HistoryScreen = () => {
  const { entries, dailyLimit } = useSugar()
  const [selectedEntry, setSelectedEntry] = useState<SugarEntry | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleEntryPress = (entry: SugarEntry) => {
    setSelectedEntry(entry)
    setModalVisible(true)
  }

  const getSugarStatusColor = (sugarAmount: number) => {
    if (sugarAmount > dailyLimit) return "#F44336" 
    if (sugarAmount < dailyLimit * 0.5) return "#FF9800" 
    return "#4CAF50" 
  }

  const renderEntryItem = ({ item }: { item: SugarEntry }) => {
    const date = new Date(item.date)
    const statusColor = getSugarStatusColor(item.totalSugar)

    return (
      <TouchableOpacity style={styles.entryItem} onPress={() => handleEntryPress(item)}>
        <View style={[styles.dateBox, { backgroundColor: statusColor }]}>
          <Text style={styles.dateDay}>{date.getDate()}</Text>
          <Text style={styles.dateMonth}>{date.toLocaleString("default", { month: "short" })}</Text>
        </View>
        <View style={styles.entryContent}>
          <Text style={styles.entryTitle}>{formatDate(item.date)}</Text>
          <Text style={styles.entrySubtitle}>{item.foods.length} food items</Text>
          <View style={styles.sugarInfo}>
            <SugarLevelIndicator current={item.totalSugar} limit={dailyLimit} small />
            <Text style={[styles.sugarAmount, { color: statusColor }]}>{item.totalSugar.toFixed(1)}g</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sugar Intake History</Text>
      </View>

      {sortedEntries.length > 0 ? (
        <FlatList
          data={sortedEntries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No history yet. Start tracking your sugar intake!</Text>
        </View>
      )}

      {/* Entry Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEntry && formatDate(selectedEntry.date)}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedEntry && (
              <>
                <View style={styles.sugarSummary}>
                  <Text style={styles.summaryTitle}>Total Sugar Intake</Text>
                  <SugarLevelIndicator current={selectedEntry.totalSugar} limit={dailyLimit} />
                  <Text style={styles.limitText}>
                    {selectedEntry.totalSugar.toFixed(1)}g of {dailyLimit}g daily limit
                  </Text>
                </View>

                <Text style={styles.foodsTitle}>Foods Consumed</Text>
                <ScrollView style={styles.foodsList}>
                  {selectedEntry.foods.map((food, index) => (
                    <View
                      key={`${food.id}-${index}`}
                      style={[styles.foodItem, { backgroundColor: food.isHealthy ? "#E8F5E9" : "#FFEBEE" }]}
                    >
                      <View style={styles.foodItemContent}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodSugar}>{food.sugarContent}g sugar</Text>
                      </View>
                      <View
                        style={[styles.healthIndicator, { backgroundColor: food.isHealthy ? "#4CAF50" : "#F44336" }]}
                      >
                        <Ionicons name={food.isHealthy ? "checkmark" : "close"} size={16} color="#fff" />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
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
  },
  listContent: {
    padding: 10,
  },
  entryItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dateDay: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateMonth: {
    color: "#fff",
    fontSize: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  entrySubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  sugarInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sugarAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
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
  sugarSummary: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  limitText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  foodsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  foodsList: {
    maxHeight: 300,
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
})

export default HistoryScreen
