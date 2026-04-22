import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

type LogEntry = {
  date: string;
  weight: number;
  sugar: number;
  steps: number;
  workout: boolean;
  walk: boolean;
  score: number;
};

const STORAGE_KEY = 'logs';

export default function HomeScreen() {
  const [weight, setWeight] = useState('');
  const [sugar, setSugar] = useState('');
  const [steps, setSteps] = useState('');
  const [workout, setWorkout] = useState(false);
  const [walk, setWalk] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setLogs(JSON.parse(data) as LogEntry[]);
    })();
  }, []);

  const save = async () => {
    const sugarNum = parseInt(sugar, 10) || 0;
    const newLog: LogEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(weight) || 0,
      sugar: sugarNum,
      steps: parseInt(steps, 10) || 0,
      workout,
      walk,
      score: (workout ? 1 : 0) + (walk ? 1 : 0) + (sugarNum <= 1 ? 1 : 0),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setWeight('');
    setSugar('');
    setSteps('');
    setWorkout(false);
    setWalk(false);
  };

  const getStreak = (key: 'workout' | 'walk') => {
    let streak = 0;
    for (let i = 0; i < logs.length; i++) {
      if (logs[i][key]) streak++;
      else break;
    }
    return streak;
  };

  const weightPoints = logs
    .slice(0, 10)
    .map((l) => ({ value: l.weight }))
    .reverse();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Wedding Fitness Tracker</Text>
        <Text style={styles.subtitle}>Stay consistent. Build discipline.</Text>

        <View style={styles.streakRow}>
          <View style={styles.card}>
            <Text style={styles.label}>Workout 🔥</Text>
            <Text style={styles.value}>{getStreak('workout')} days</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Walk 🚶</Text>
            <Text style={styles.value}>{getStreak('walk')} days</Text>
          </View>
        </View>

        <View style={styles.cardFull}>
          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#94a3b8"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Sugar (servings)"
            placeholderTextColor="#94a3b8"
            value={sugar}
            onChangeText={setSugar}
            keyboardType="number-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Steps (optional)"
            placeholderTextColor="#94a3b8"
            value={steps}
            onChangeText={setSteps}
            keyboardType="number-pad"
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Workout</Text>
            <Switch value={workout} onValueChange={setWorkout} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>40 min walk</Text>
            <Switch value={walk} onValueChange={setWalk} />
          </View>

          <Button title="Save Day" onPress={save} />
        </View>

        {weightPoints.length > 1 && (
          <View style={styles.cardFull}>
            <Text style={styles.sectionHeading}>Weight Trend</Text>
            <LineChart
              data={weightPoints}
              color="#38bdf8"
              thickness={2}
              hideDataPoints={false}
              dataPointsColor="#38bdf8"
              yAxisTextStyle={{ color: '#94a3b8' }}
              xAxisLabelTextStyle={{ color: '#94a3b8' }}
              yAxisColor="#334155"
              xAxisColor="#334155"
              rulesColor="#1e293b"
              initialSpacing={10}
              spacing={30}
              noOfSections={4}
              height={150}
            />
          </View>
        )}

        <Text style={styles.sectionHeading}>Recent Logs</Text>
        {logs.slice(0, 5).map((l, i) => (
          <View key={`${l.date}-${i}`} style={styles.history}>
            <Text style={styles.rowLabel}>{l.date}</Text>
            <Text style={styles.subtitle}>
              W:{l.weight} | S:{l.sugar} | Score:{l.score}/3
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 20,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    width: '48%',
  },
  cardFull: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
  },
  value: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#0f172a',
    color: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowLabel: {
    color: 'white',
  },
  sectionHeading: {
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  history: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
});
