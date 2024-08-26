import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';


type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined; // Navigate to the tab navigator
  CalculationTable: undefined;
  Plot3D: undefined;
  Targets: undefined;
  WellPlan: undefined;
  NETPlots: undefined;
  PathScaling: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;
type SplashScreenRouteProp = RouteProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
  route: SplashScreenRouteProp;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    // Navigate to MainTabs (which contains Home) after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('MainTabs'); // Ensure this matches the name of the Tab Navigator in your Stack Navigator
    }, 3000);

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../logo.png')} // Replace with your image path
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Optional: set your background color
  },
  image: {
    width: 150, // Set the width of your image
    height: 150, // Set the height of your image
    resizeMode: 'contain',
  },
});

export default SplashScreen;
