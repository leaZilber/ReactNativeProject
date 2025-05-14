import { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useSugar } from "../../contexts/SugarContext"

const ProfileScreen = () => {
    const { user, logout } = useAuth()
    const { dailyLimit, setDailyLimit } = useSugar()
    const [isEditing, setIsEditing] = useState(false)
    const [newLimit, setNewLimit] = useState(dailyLimit.toString())
    const [isLoading, setIsLoading] = useState(false)
    const [notifications, setNotifications] = useState(true)
    const [darkMode, setDarkMode] = useState(false)

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: () => logout() },
        ])
    }

    const handleSaveLimit = async () => {
        const limitValue = Number.parseFloat(newLimit)
        if (isNaN(limitValue) || limitValue <= 0) {
            Alert.alert("Error", "Please enter a valid number greater than 0")
            return
        }

        setIsLoading(true)
        try {
            await setDailyLimit(limitValue)
            setIsEditing(false)
            Alert.alert("Success", "Daily sugar limit updated successfully")
        } catch (error) {
            Alert.alert("Error", "Failed to update daily limit")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleNotifications = () => {
        setNotifications(!notifications)
    }

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileInitial}>{user?.username ? user.username[0].toUpperCase() : "U"}</Text>
                    </View>
                    <Text style={styles.username}>{user?.username || "User"}</Text>
                    <Text style={styles.email}>{user?.email || "user@example.com"}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sugar Tracking Settings</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLabelContainer}>
                            <Ionicons name="speedometer-outline" size={24} color="#4CAF50" />
                            <Text style={styles.settingLabel}>Daily Sugar Limit</Text>
                        </View>

                        {isEditing ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.limitInput}
                                    value={newLimit}
                                    onChangeText={setNewLimit}
                                    keyboardType="numeric"
                                    placeholder="Enter limit in grams"
                                />
                                <View style={styles.editButtons}>
                                    <TouchableOpacity
                                        style={[styles.editButton, styles.cancelButton]}
                                        onPress={() => {
                                            setIsEditing(false)
                                            setNewLimit(dailyLimit.toString())
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.editButton, styles.saveButton]}
                                        onPress={handleSaveLimit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.limitContainer}>
                                <Text style={styles.limitValue}>{dailyLimit}g</Text>
                                <TouchableOpacity style={styles.editLimitButton} onPress={() => setIsEditing(true)}>
                                    <Ionicons name="pencil" size={18} color="#4CAF50" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLabelContainer}>
                            <Ionicons name="notifications-outline" size={24} color="#4CAF50" />
                            <Text style={styles.settingLabel}>Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: "#ccc", true: "#A5D6A7" }}
                            thumbColor={notifications ? "#4CAF50" : "#f4f3f4"}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLabelContainer}>
                            <Ionicons name="moon-outline" size={24} color="#4CAF50" />
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: "#ccc", true: "#A5D6A7" }}
                            thumbColor={darkMode ? "#4CAF50" : "#f4f3f4"}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <TouchableOpacity style={styles.aboutItem}>
                        <View style={styles.aboutItemContent}>
                            <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
                            <Text style={styles.aboutItemText}>About Sugar Tracker</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.aboutItem}>
                        <View style={styles.aboutItemContent}>
                            <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
                            <Text style={styles.aboutItemText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.aboutItem}>
                        <View style={styles.aboutItemContent}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
                            <Text style={styles.aboutItemText}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#F44336" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Sugar Tracker v1.0.0</Text>
            </ScrollView>
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
    content: {
        flex: 1,
        padding: 15,
    },
    profileSection: {
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    profileIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    profileInitial: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#fff",
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: "#666",
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    settingLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    settingLabel: {
        fontSize: 16,
        color: "#333",
        marginLeft: 10,
    },
    limitContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    limitValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4CAF50",
        marginRight: 10,
    },
    editLimitButton: {
        padding: 5,
    },
    editContainer: {
        flex: 1,
        marginLeft: 15,
    },
    limitInput: {
        backgroundColor: "#f5f5f5",
        padding: 8,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 8,
    },
    editButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    editButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cancelButtonText: {
        color: "#666",
    },
    saveButton: {
        backgroundColor: "#4CAF50",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    aboutItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    aboutItemContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    aboutItemText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F44336",
        marginLeft: 10,
    },
    versionText: {
        textAlign: "center",
        color: "#999",
        marginBottom: 20,
    },
})

export default ProfileScreen
