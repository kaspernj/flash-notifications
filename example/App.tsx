import { Container, FlashNotifications } from 'flash-notifications';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import useSystemTest from 'system-testing/build/use-system-test.js';

export default function App() {
  useSystemTest();

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.container}
        testID="systemTestingComponent"
        // @ts-expect-error dataSet is supported at runtime for React Native Web
        dataSet={{ focussed: 'true' }}
      >
        <Text testID="blankText" style={styles.blankText}>
          Blank
        </Text>
        <ScrollView style={styles.container}>
          <Text style={styles.header}>Flash notifications example</Text>
          <Group name="System test">
            <Pressable
              onPress={() => FlashNotifications.success('Dismiss me')}
              style={styles.testButton}
              testID="flashNotifications/showNotification"
            >
              <Text style={styles.testButtonText}>Show notification</Text>
            </Pressable>
          </Group>
        </ScrollView>
        <Container />
      </View>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  testButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  blankText: {
    marginLeft: 20,
    marginTop: 8,
  },
};
