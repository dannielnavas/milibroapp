import DateTimePicker from "@react-native-community/datetimepicker";
import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DateInputProps {
  label: string;
  date: Date;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
  onDateChange: (date: Date) => void;
  error?: string;
  touched?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  date,
  showPicker,
  setShowPicker,
  onDateChange,
  error,
  touched,
}) => (
  <View style={styles.dateContainer}>
    <Text style={styles.label}>{label}</Text>
    <Pressable onPress={() => setShowPicker(true)}>
      <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
    </Pressable>
    {showPicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setShowPicker(false);
          if (selectedDate) {
            onDateChange(selectedDate);
          }
        }}
      />
    )}
    {error && touched && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#666",
  },
  dateText: {
    fontSize: 16,
    color: "#05453e",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
