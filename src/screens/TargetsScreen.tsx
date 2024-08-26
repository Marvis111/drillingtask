import React, { useState } from 'react';
import RNFS from 'react-native-fs';
import { View, Text, TextInput,Image, StyleSheet, ScrollView, TouchableOpacity, Alert, } from 'react-native';
import { Platform,Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import * as XLSX from 'xlsx';
import Modal from 'react-native-modal';
import screens from '../navigations/screens';
//import Share from 'react-native-share';
let PermissionsAndroid:any;
if (Platform.OS === 'android') {
    PermissionsAndroid = require('react-native').PermissionsAndroid;
}

const TargetsScreen: React.FC = (prop:any) => {
  type Target = {
    north: string;
    east: string;
    tvd: string;
  };
  
  const [surfaceLocation, setSurfaceLocation] = useState({ north: '', east: '', tvd: '' });
  const [targets, setTargets] = useState<Target[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const [isDataProcessed, setIsDataProcessed] = useState<boolean>(false);
  const [isKOPManual, setIsKOPManual] = useState(false); // Track if the KOP input is manual
  let [kopValue, setKOPValue] = useState(''); // Store the manual KOP value
  const [interval, setInterval] = useState(10); // Store the depth interval
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  
  const navigation = prop.navigation;

  const handleAddTarget = () => {
    setTargets([...targets, { north: '', east: '', tvd: '' }]);
  };

  const handleRemoveTarget = (index: number) => {
    const updatedTargets = targets.filter((_, i) => i !== index);
    setTargets(updatedTargets);
  };

  const handleTargetChange = (index: number, key: keyof Target, value: string) => {
    const updatedTargets = [...targets];
    updatedTargets[index][key] = value;
    setTargets(updatedTargets);
  };

  const handlePlan = () => {
    // Validation for Surface Location
    if (!surfaceLocation.north || !surfaceLocation.east || !surfaceLocation.tvd) {
      Alert.alert("Validation Error", "Please fill in all Surface Location fields.");
      return;
    }
  
    // Validation for Targets: At least one target must be filled
    if (targets.length === 0) {
      Alert.alert("Validation Error", "Please add at least one Target Location.");
      return;
    }
  
    let atLeastOneTargetFilled = false;
  
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].north && targets[i].east && targets[i].tvd) {
        atLeastOneTargetFilled = true;
      } else if (!targets[i].north || !targets[i].east || !targets[i].tvd) {
        Alert.alert("Validation Error", `Please fill in all fields for Target ${i + 1}.`);
        return;
      }
    }
  
    if (!atLeastOneTargetFilled) {
      Alert.alert("Validation Error", "Please ensure at least one Target Location is completely filled.");
      return;
    }
    // If validation is successful, navigate to a new route with the data
    setIsDrawerVisible(true); // Show the drawer when "Generate Data" is clicked
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

    const requestStoragePermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to your storage to upload files',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          return false;
        }
      } else {
        return true;
      }
    };
  
  
    const handleFileUpload = async () => {
      const permissionGranted = await requestStoragePermission();
      if (!permissionGranted) return;
    
      try {
        // Allow the user to pick a file
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles], // You can specify CSV or XLSX specifically if you want
        });
    
        // Ensure the response is valid
        if (res && res[0] && res[0].uri) {
          const filePath = res[0].uri;
          console.log(filePath);
    
          // Check the file extension
          if (filePath.endsWith('.csv')) {
            // Read and process CSV file
            const fileContent = await RNFS.readFile(filePath, 'utf8');
            processCSV(fileContent);
          } else if (filePath.endsWith('.xlsx')) {
            // Read and process XLSX file
            const fileContent = await RNFS.readFile(filePath, 'base64');
            processXLSX(fileContent);
          } else {
            Alert.alert('Unsupported File', 'Please select a CSV or XLSX file.');
          }
        } else {
          Alert.alert('Error', 'No file selected.');
        }
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log('User canceled the file picker');
        } else {
          console.error(err);
          Alert.alert('Error', 'Failed to read the file.');
        }
      }
    };
    
    
    const processCSV = (data:any) => {
      const rows = data.split('\n');
      const parsedData = rows.map((row:any) => row.split(','));
      console.log('Parsed CSV Data:', parsedData);
      // Do something with the parsed CSV data
    };
    
    const processXLSX = (base64Content:any) => {
      try {
        // Decode the base64 content into binary data
        const binaryString = atob(base64Content);
        
        // Parse the binary string into a workbook
        const workbook = XLSX.read(binaryString, { type: 'binary' });
    
        // Get the first worksheet from the workbook
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
    
        // Convert the worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Parsed XLSX Data:', jsonData);
        
        // Do something with the parsed JSON data
      } catch (err) {
        Alert.alert('Error', 'Failed to process the XLSX file.');
        console.error(err);
      }
    };
  
    const handleLoadData = () => {
      // Implement logic to load the data
      console.log('Data Loaded:', fileData);
      toggleModal();
    };

    

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[{ justifyContent: 'space-between', flexDirection: 'row',alignItems: 'center' }]}>
        <Text style={styles.header}>Directional Survey</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={toggleModal}>
          <Ionicons name="cloud-upload-outline" size={20} color="#007AFF" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.row}>
        <Text style={styles.label}>Surface Location</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={surfaceLocation.north}
          onChangeText={(text) => setSurfaceLocation({ ...surfaceLocation, north: text })}
          placeholder="N (ft)"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={surfaceLocation.east}
          onChangeText={(text) => setSurfaceLocation({ ...surfaceLocation, east: text })}
          placeholder="E (ft)"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={surfaceLocation.tvd}
          onChangeText={(text) => setSurfaceLocation({ ...surfaceLocation, tvd: text })}
          placeholder="TVD (ft)"
        />
      </View>
      {targets.map((target, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>Target {index + 1} </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={target.north}
            onChangeText={(text) => handleTargetChange(index, 'north', text)}
            placeholder="N (ft)"
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={target.east}
            onChangeText={(text) => handleTargetChange(index, 'east', text)}
            placeholder="E (ft)"
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={target.tvd}
            onChangeText={(text) => handleTargetChange(index, 'tvd', text)}
            placeholder="TVD (ft)"
          />
          <TouchableOpacity onPress={() => handleRemoveTarget(index)} style={styles.removeButton}>
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.row}>
        <Text style={styles.label}>Input Manual KOP?</Text>
        <Switch
          value={isKOPManual}
          onValueChange={setIsKOPManual}
        />

        {isKOPManual && (
          <TextInput
            style={[styles.input, { flex: 2 }]} // Adjust flex to ensure the input field takes the appropriate space
            keyboardType="numeric"
            value={kopValue}
            onChangeText={setKOPValue}
            placeholder="Enter KOP (ft)"
          />
        )}
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.unitToggle} onPress={handleAddTarget}>
          <Text style={styles.unitText}>Add Target</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.unitPlan} onPress={handlePlan}>
          <Text style={styles.unitPlanText}>Generate Data</Text>
        </TouchableOpacity>
      </View>
      {/* Modal Component */}
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
      <View style={styles.modalContent}>
        <Text style={styles.modalHeader}>Upload Your Data</Text>

        <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
          <Text style={styles.uploadText}>Upload CSV/XLSX</Text>
        </TouchableOpacity>

        {isDataProcessed && (
          <Text style={styles.successText}>Data processed successfully. You can now load the data.</Text>
        )}

        <TouchableOpacity
          style={[styles.loadButton, !isDataProcessed && { backgroundColor: '#ccc' }]}
          onPress={handleLoadData}
          disabled={!isDataProcessed}
        >
          <Text style={styles.loadButtonText}>Load Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sampleDataButton} >
        
        <Text style={styles.sampleDataText}>View Sample Data</Text>
        <Image
          source={require('../excel.png')} // Adjust the path to your image
          style={styles.icon}
        />
      </TouchableOpacity>


        <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>

   {/* Modal drawer for Depth Interval input */}
   <Modal
  isVisible={isDrawerVisible}
  onBackdropPress={() => setIsDrawerVisible(false)} // Close drawer on backdrop press
  style={styles.modal}
  swipeDirection="down"
  onSwipeComplete={() => setIsDrawerVisible(false)} // Allow swipe down to close
>
  <View style={styles.depthDrawer}>
    <Text style={styles.depthDrawerTitle}>Enter Depth Interval</Text>
    <TextInput
      style={styles.depthInput}
      keyboardType="numeric"
      placeholder="Depth Interval (ft)"
      value={String(interval)} // Display the current interval as a string
      onChangeText={(text) => setInterval(Number(text))} // Update the interval state with the numeric value
    />
    {/* Buttons Row */}
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={styles.depthCloseButton}
        onPress={() => setIsDrawerVisible(false)}
      >
        <Text style={styles.depthCloseButtonText}>Close</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.depthContinueButton}
        onPress={() => {
          // Add your continue logic here
          kopValue = isKOPManual ? kopValue : '';
          navigation.navigate(screens.WELL_PLAN, { surfaceLocation, targets, kopValue, interval });
          //setIsDrawerVisible(false);
        }}
      >
        <Text style={styles.depthContinueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};


const styles = StyleSheet.create({
  kopSwitchOn: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  kopSwitchOff: {
    padding: 8,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  switchText: {
    color: 'white',
    fontWeight: 'bold',
  },
  icon: {
    width: 300, // Adjust size as needed
    resizeMode: 'contain', // Ensures the image fits within the bounds
    height: 200, // Adjust size as needed
  },
  container: {
    padding: 16,
    flex:1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  unitToggle: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    fontWeight: '800',
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  unitPlan: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    fontWeight: '800',
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  unitPlanText: {
    color: 'white',
    textAlign: 'center',
  },
  unitText: {
    color: '#000',
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
    backgroundColor: '#ff4d4d',
    borderRadius: 4,
    marginLeft: 8,
    paddingLeft: 10,
    paddingRight: 10,
  },
  removeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 8,
    borderRadius: 7,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
  },
  uploadText: {
    marginLeft: 8,
    color: '#007AFF',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  successText: {
    color: '#28a745',
    marginVertical: 10,
    textAlign: 'center',
  },
  loadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  loadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sampleDataButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  sampleDataText: {
    color: '#007AFF',
    fontSize: 16,
  },
  depthDrawer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  depthDrawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  depthInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
    marginBottom: 20,
  },modal: {
    justifyContent: 'flex-end',
    margin: 0,
  }, depthCloseButton: {
    backgroundColor: '#FF4D4D', // Red color for Close button
    padding: 12,
    borderRadius: 10,
    width: '48%', // Half-width to fit two buttons side by side
    alignItems: 'center',
  },
  depthCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  depthContinueButton: {
    backgroundColor: '#007AFF', // Blue color for Continue button
    padding: 12,
    borderRadius: 10,
    width: '48%', // Half-width to fit two buttons side by side
    alignItems: 'center',
  },
  depthContinueButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TargetsScreen;
