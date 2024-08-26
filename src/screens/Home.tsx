// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import screens from '../navigations/screens';

// const HomeScreen: React.FC = () => {
//   type Target = {
//     north: string;
//     east: string;
//     tvd: string;
//   };
  
//   const [surfaceLocation, setSurfaceLocation] = useState({ north: '', east: '', tvd: '' });
//   const [targets, setTargets] = useState<Target[]>([]);
//   const navigation = useNavigation();

//   const handleAddTarget = () => {
//     setTargets([...targets, { north: '', east: '', tvd: '' }]);
//   };

//   const handleRemoveTarget = (index: number) => {
//     const updatedTargets = targets.filter((_, i) => i !== index);
//     setTargets(updatedTargets);
//   };

//   const handleTargetChange = (index: number, key: keyof Target, value: string) => {
//     const updatedTargets = [...targets];
//     updatedTargets[index][key] = value;
//     setTargets(updatedTargets);
//   };

//   const handlePlan = () => {
//     // Validation for Surface Location
//     if (!surfaceLocation.north || !surfaceLocation.east || !surfaceLocation.tvd) {
//       Alert.alert("Validation Error", "Please fill in all Surface Location fields.");
//       return;
//     }
  
//     // Validation for Targets: At least one target must be filled
//     if (targets.length === 0) {
//       Alert.alert("Validation Error", "Please add at least one Target Location.");
//       return;
//     }
  
//     let atLeastOneTargetFilled = false;
//     for (let i = 0; i < targets.length; i++) {
//       if (targets[i].north && targets[i].east && targets[i].tvd) {
//         atLeastOneTargetFilled = true;
//       } else if (!targets[i].north || !targets[i].east || !targets[i].tvd) {
//         Alert.alert("Validation Error", `Please fill in all fields for Target ${i + 1}.`);
//         return;
//       }
//     }
  
//     if (!atLeastOneTargetFilled) {
//       Alert.alert("Validation Error", "Please ensure at least one Target Location is completely filled.");
//       return;
//     }
//     // If validation is successful, navigate to a new route with the data
//     navigation.navigate(screens.CalculationTable, { surfaceLocation, targets });
//   };
  

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Directional Survey Methods</Text>

//       <View style={styles.row}>
//         <Text style={styles.label}>Surface Location</Text>
//         <TextInput
//           style={styles.input}
//           keyboardType="numeric"
//           value={surfaceLocation.north}
//           onChangeText={(text) => setSurfaceLocation({ ...surfaceLocation, north: text })}
//           placeholder="N (ft)"
//         />
//         <TextInput
//           style={styles.input}
//           keyboardType="numeric"
//           value={surfaceLocation.east}
//           onChangeText={(text) => setSurfaceLocation({ ...surfaceLocation, east: text })}
//           placeholder="E (ft)"
//         />
//         <TextInput
//           style={styles.input}
//           keyboardType="numeric"
//           value={surfaceLocation.tvd}
//           onChangeText={(text) => setSurfaceLocation({ ...surfaceLocation, tvd: text })}
//           placeholder="TVD (ft)"
//         />
//       </View>
//       {targets.map((target, index) => (
//         <View key={index} style={styles.row}>
//           <Text style={styles.label}>Target {index + 1} </Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             value={target.north}
//             onChangeText={(text) => handleTargetChange(index, 'north', text)}
//             placeholder="N (ft)"
//           />
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             value={target.east}
//             onChangeText={(text) => handleTargetChange(index, 'east', text)}
//             placeholder="E (ft)"
//           />
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             value={target.tvd}
//             onChangeText={(text) => handleTargetChange(index, 'tvd', text)}
//             placeholder="TVD (ft)"
//           />
//           <TouchableOpacity onPress={() => handleRemoveTarget(index)} style={styles.removeButton}>
//             {/* <Icon name="trash" size={20} color="#fff" /> */}
//             <Text style={styles.removeButtonText}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       <View style={styles.bottomRow}>
//         <TouchableOpacity style={styles.unitToggle} onPress={handleAddTarget}>
//           <Text style={styles.unitText}>Add Target</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.bottomRow}>
//         <TouchableOpacity style={styles.unitPlan} onPress={handlePlan}>
//           <Text style={styles.unitPlanText}>Plan</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     padding: 15,
//     backgroundColor: '#fff',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 6,
//     marginTop: 5,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   label: {
//     flex: 1,
//     fontSize: 16,
//   },
//   input: {
//     flex: 1,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginHorizontal: 8,
//     textAlign: 'center',
//   },
//   bottomRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 24,
//   },
//   unitToggle: {
//     flex: 1,
//     fontSize: 16,
//     textAlign: 'center',
//     paddingVertical: 12,
//     borderWidth: 1,
//     borderColor: '#007AFF',
//     fontWeight: '800',
//     marginHorizontal: 8,
//     borderRadius: 20,
//     backgroundColor: '#f8f8f8',
//   },
//   unitPlan: {
//     flex: 1,
//     fontSize: 16,
//     textAlign: 'center',
//     paddingVertical: 12,
//     borderWidth: 1,
//     borderColor: '#007AFF',
//     fontWeight: '800',
//     marginHorizontal: 8,
//     borderRadius: 20,
//     backgroundColor: '#007AFF',
//   },
//   unitPlanText: {
//     color: 'white',
//     textAlign: 'center',
//   },
//   unitText: {
//     color: '#000',
//     textAlign: 'center',
//   },
//   removeButton: {
//     padding: 4,
//     backgroundColor: '#ff4d4d',
//     borderRadius: 4,
//     marginLeft: 8,
//     paddingLeft: 10,
//     paddingRight: 10,
//   },
//   removeButtonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
// });

import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity,Dimensions } from 'react-native';

type Item = {
  title: string;
  description: string;
  color: string;
};



const HomeScreen: React.FC = (prop:any) => {
  // Function to handle redirection
  const navigation = prop.navigation
  const redirectURL = (title:string) => {
    let url;
    switch (title) {
      case 'Home':
        url = 'Home'; // Change this to your actual screen name or URL
        break;
      case 'Targets':
        url = 'Targets';
        break;
      case 'Well Plan':
        url = 'WellPlan';
        break;
      case 'NET Plots':
        url = 'NETPlots';
        break;
      case 'Path Scaling':
        url = 'PathScaling';
        break;
      default:
        url = 'Home'; // Fallback URL or screen
    }

    // Navigate to the screen
    navigation.navigate(url);
  };
  const items: Item[] = [
    {
      title: 'Home',
      description: 'Get a quick overview of your projects and access key sections of the platform from the dashboard.',
      color: '#E5F8EC'
    },
    {
      title: 'Targets',
      description: 'Set and track drilling targets with precision tools to optimize your project outcomes.',
      color: '#E5F4FF'
    },
    {
      title: 'Well Plan',
      description: 'View detailed well plans and schematics to guide your drilling operations effectively.',
      color: '#FFE5EF'
    },
    {
      title: 'NET Plots',
      description: 'Analyze NET plots to monitor drilling progress and make informed decisions.',
      color: '#EEE5FF'
    },
    {
      title: 'Path Scaling',
      description: 'Adjust drilling paths and scale operations for optimal performance.',
      color: '#E5F4FF'
    }
]


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={[styles.card, { backgroundColor: item.color }]} onPress={() => redirectURL(item.title)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.explore}>Explore</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // This makes the container take up the entire height of the screen
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
  card: {
    width: Dimensions.get('window').width / 2.3,
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  explore: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
