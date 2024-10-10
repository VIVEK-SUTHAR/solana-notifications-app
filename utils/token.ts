import messaging from "@react-native-firebase/messaging";

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

export default getFCMTokenFromFirebase;
