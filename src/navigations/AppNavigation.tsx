// @ts-ignore
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image } from 'react-native';  
import HomeScreen from '../screens/Home';
import CalculationTable from '../screens/CalcTable';
import Plot3DScreen from '../screens/Plot3DScreen';
import SplashScreen from '../screens/SplashScreen';
import TargetsScreen from '../screens/TargetsScreen';
import WellPlanScreen from '../screens/WellPlanScreen';
import NETPlotsScreen from '../screens/NETPlotsScreen';
import PathScalingScreen from '../screens/PathScalingScreen';
import screens from './screens';
import Plot2DScreen from '../screens/Plot2DScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case screens.HOME:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case screens.TARGETS:
              iconName = focused ? 'locate' : 'locate-outline';
              break;
            case screens.WELL_PLAN:
              iconName = focused ? 'map' : 'map-outline';
              break;
            case screens.NET_PLOTS:
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case screens.PATH_SCALING:
              iconName = focused ? 'options' : 'options-outline';
              break;
            default:
              iconName = 'home-outline';
              break;
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#007AFF',  // Active color
        tabBarInactiveTintColor: 'gray',   // Inactive color
        tabBarStyle: {
          backgroundColor: '#fff', // Tab background color
          height: 60,  // Adjust height as needed
        },
      })}
    >
      <Tab.Screen name={screens.HOME}  component={HomeScreen} options={{ tabBarLabel: 'Home', headerShown: false }}   />
      <Tab.Screen name={screens.TARGETS} component={TargetsScreen} options={{ tabBarLabel: 'Targets', headerShown: false  }} />
      <Tab.Screen name={screens.WELL_PLAN} component={WellPlanScreen} options={{ tabBarLabel: 'Well Plan', headerShown: false  }} />
      <Tab.Screen name={screens.NET_PLOTS} component={NETPlotsScreen} options={{ tabBarLabel: 'NET Plots' , headerShown: false }} />
      <Tab.Screen name={screens.PATH_SCALING} component={PathScalingScreen} options={{ tabBarLabel: 'Path Scaling' , headerShown: false }} />
    </Tab.Navigator>
  );
};

const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          gestureEnabled: false,
          headerTitle: '',  // Remove the default title
          headerTintColor: '#fff',
          header: () => (
            <Image
              source={require('../sub_logo.png')} // Replace with your logo path
              style={{ width: 120, height: 40, margin: 'auto',marginTop:10 }} // Adjust as needed
            />
          ),
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={screens.Plot2DScreen}
          component={Plot2DScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name={screens.CalculationTable}
          component={CalculationTable}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={screens.Plot3D}
          component={Plot3DScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
