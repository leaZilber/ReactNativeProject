import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import DailyCalculatorScreen from "../screens/main/DailyCalculatorScreen"
import HistoryScreen from "../screens/main/HistoryScreen"
import MealPlanningScreen from "../screens/main/MealPlanningScreen"
import ProfileScreen from "../screens/main/ProfileScreen"

const Tab = createBottomTabNavigator()

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "DailyCalculator") {
            iconName = focused ? "calculator" : "calculator-outline"
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline"
          } else if (route.name === "MealPlanning") {
            iconName = focused ? "restaurant" : "restaurant-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="DailyCalculator" component={DailyCalculatorScreen} options={{ title: "Daily Sugar" }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: "History" }} />
      <Tab.Screen name="MealPlanning" component={MealPlanningScreen} options={{ title: "Meal Plan" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  )
}

export default MainNavigator
