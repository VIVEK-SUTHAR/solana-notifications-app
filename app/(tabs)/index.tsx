import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import messaging from "@react-native-firebase/messaging";
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#9945FF',
  secondary: '#14F195',
  background: '#121212',
  cardBg: '#1C1C1C',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  error: '#FF6B6B',
};

async function getFCMTokenFromFirebase() {
  try {
    await messaging().requestPermission();
    await messaging().registerDeviceForRemoteMessages();
    const notificationToken = await messaging().getToken();
    console.log("Token", notificationToken);
    return notificationToken;
  } catch (error) {
    throw new Error("Failed to get token");
  }
}

async function registerTokenWithAddress(address: string, token: string) {
  try {
    const response = await fetch('http://192.168.1.3:8080/registerTokenForAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, token }),
    });

    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  } catch (error) {
    console.log(error)
    throw new Error('Failed to register token');
  }
}

export default function HomeScreen() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [token, setToken] = useState('');

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Success', 'Notification permissions granted!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permission');
    }
  };

  const handleRegistration = async () => {
    if (!address) {
      Alert.alert('Error', 'Please enter a valid address');
      return;
    }

    setLoading(true);
    try {
      const fcmToken = await getFCMTokenFromFirebase();
      await registerTokenWithAddress(address, fcmToken);
      setToken(fcmToken);
      setRegistered(true);
      Alert.alert('Success', 'Successfully registered for notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to register token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.background, '#2C1F4A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Notification Registration</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Wallet Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            placeholderTextColor={COLORS.textSecondary}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <LinearGradient
            colors={[COLORS.secondary + '20', COLORS.secondary + '40']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Enable Notifications</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.disabledButton]}
          onPress={handleRegistration}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.primary, '#7B2FFF']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>Register Device</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {registered && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>🎉 Successfully Registered!</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    marginTop: 40,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  permissionButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  successText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  tokenText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingHorizontal: 20,
  },
});
