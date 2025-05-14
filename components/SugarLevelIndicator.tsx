import type React from "react"
import { View, StyleSheet } from "react-native"

type SugarLevelIndicatorProps = {
  current: number
  limit: number
  small?: boolean
}

const SugarLevelIndicator: React.FC<SugarLevelIndicatorProps> = ({ current, limit, small = false }) => {
  const percentage = Math.min((current / limit) * 100, 100)

  let color = "#4CAF50" // Green for good range
  if (percentage > 100) {
    color = "#F44336" // Red for over limit
  } else if (percentage < 50) {
    color = "#FF9800" // Orange for under half of limit
  }

  return (
    <View style={[styles.container, small && styles.smallContainer]}>
      <View style={styles.track}>
        <View
          style={[styles.progress, { width: `${percentage}%`, backgroundColor: color }, small && styles.smallProgress]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 20,
    marginVertical: 5,
  },
  smallContainer: {
    height: 10,
    marginVertical: 2,
  },
  track: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 10,
  },
  smallProgress: {
    height: "100%",
  },
})

export default SugarLevelIndicator
