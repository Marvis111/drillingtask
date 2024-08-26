import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Switch } from 'react-native';
import screens from '../navigations/screens';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
interface CalculationTableProps {
  route: {
    params: {
      interval: number;
      kopValue: string;
      surfaceLocation: {
        north: string;
        east: string;
        tvd: string;
      };
      targets: {
        north: string;
        east: string;
        tvd: string;
      }[];
    };
  };
  navigation:any
}

const WellPlanScreen: React.FC<CalculationTableProps> = ({ route,navigation }) => {
  
  // Check if params were passed
  if (!route.params || !route.params.surfaceLocation || !route.params.targets || route.params.targets.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No target data passed.</Text>
      </View>
    );
  }
  const { surfaceLocation, targets , interval, kopValue} = route.params;
/**
 measuredDepth: number;
    inclination: number;
    azimuth: number;
    north?:number;
    east?:number;
    tvd?:number;
    rf?:number;
    dls?:number;
    dogleg:number;
 */
  const well_parameters= [
    {title:"Measured Depth",placeholder:"measuredDepth"},
    {title:"Azimuth",placeholder:"azimuth"},
    {title:"North (ft)",placeholder:"north"},
    {title:"East (ft)",placeholder:"east"},
    {title:"True Vertical Depth (ft)",placeholder:"tvd"},
    {title:"RF",placeholder:"rf"},
    {title:"DLS",placeholder:"dls"},
    {title:"Dogleg (ft)",placeholder:"dogleg"},
  ]
  

  //KOP DETERMINATION SETUP
  type KOPParameters = {
    x: number; // Horizontal displacement component in the x-direction (e.g., 2500 feet)
    y: number; // Horizontal displacement component in the y-direction (e.g., -600 feet)
    tvd: number; // True Vertical Depth (TVD) to the target (e.g., 2400 feet)
    buildRate?: number; // Build Rate (BR) in degrees per 100 feet, default is 2 degrees
  };

  const [showWellPath, setShowWellPath] = useState(false);
  const [showXYZPath, setShowXYZPath] = useState(false);
  const [showCurvature, setShowCurvature] = useState(false);
  const [showBuildWalk, setShowBuildWalk] = useState(false);
 // const navigation = useNavigation();
  const [selectedValue, setSelectedValue] = useState(null);
  const [secondAxis,setSecondAxis] = useState(null);
  function calculateKOP({ x, y, tvd, buildRate = 2 }: KOPParameters): number {
    // Step 1: Calculate Horizontal Displacement (HD)
    const hd = Math.sqrt(x ** 2 + y ** 2);
  
    // Step 2: Calculate Measured Depth (MD)
    const md = Math.sqrt(tvd ** 2 + hd ** 2);
  
    // Step 3: Calculate the Inclination Angle (ϕ) in degrees
    const inclinationAngle = Math.atan(hd / tvd) * (180 / Math.PI);
  
    // Step 4: Calculate the MD when the well has inclined to the target angle
    const mdInclined = (inclinationAngle / buildRate) * 100;
  
    // Step 5: Calculate KOP
    const kop = md - mdInclined;
  
    return kop;
  }
  // Example usage:
  const kopParameters = {
    x: Number(surfaceLocation.east) - Number(targets[0].east), // Horizontal displacement in the x-direction in feet
    y: Number(surfaceLocation.north) - Number(targets[0].north), // Horizontal displacement in the y-direction in feet
    tvd: Number(targets[0].tvd), // True Vertical Depth to the target in feet
  };

  const kop = kopValue == null || kopValue.trim() === '' ? calculateKOP(kopParameters).toFixed(2) : kopValue;
  
  const combinedLocations = [
    surfaceLocation, // The first element is the surface location
    {'east':surfaceLocation['east'],'north':surfaceLocation['north'],'tvd':kop}, //Including the KOP Targets here
    ...targets, // Spread the targets array to include each target as an individual element
  ];

  function interpolateData(dataPoints :any, interval: number) {
      const result = [];
      
      for (let i = 0; i < dataPoints.length - 1; i++) {
          const startPoint = dataPoints[i];
          const endPoint = dataPoints[i + 1];
          
          const startTVD = parseFloat(startPoint.tvd);
          const endTVD = parseFloat(endPoint.tvd);
          
          const startNorth = parseFloat(startPoint.north);
          const endNorth = parseFloat(endPoint.north);
          
          const startEast = parseFloat(startPoint.east);
          const endEast = parseFloat(endPoint.east);
          
          const numberOfSteps = Math.floor((endTVD - startTVD) / interval);
          
          for (let j = 0; j <= numberOfSteps; j++) {
              const currentTVD = startTVD + j * interval;
              const interpolationFactor = (currentTVD - startTVD) / (endTVD - startTVD);
              
              const interpolatedNorth = startNorth + interpolationFactor * (endNorth - startNorth);
              const interpolatedEast = startEast + interpolationFactor * (endEast - startEast);
              
              result.push({
                  tvd: currentTVD.toFixed(2),
                  north: interpolatedNorth.toFixed(2),
                  east: interpolatedEast.toFixed(2)
              });
          }
      }
      
      // Include the last data point
      const lastPoint = dataPoints[dataPoints.length - 1];
      result.push({
          tvd: lastPoint.tvd,
          north: lastPoint.north,
          east: lastPoint.east
      });

      return result;
  }

const interpolatedData = interpolateData(combinedLocations, interval);

  
  //MIA DETERMINATION SETUP
  type NETLocation = {
    north: number;
    east: number;
    tvd: number;
  };
  
  type MIAResult = {
    measuredDepth: number;
    inclination: number;
    azimuth: number;
    north?:number;
    east?:number;
    tvd?:number;
    rf?:number;
    dls?:number;
    dogleg:number;
  };
  
  function applyEtajeMapping(azimuth: number): number {
    if (azimuth>= 0 && azimuth <= 120) {
      return 1.5 * azimuth;
    } else if (azimuth >= 240 && azimuth <= 360) {
      return 1.5 * azimuth - 180;
    } else {
      return azimuth; // No adjustment if inclination does not fall into the specified ranges
    }
  }

  function calculateMIAforLocations(locations: NETLocation[]): MIAResult[] {
  const results: MIAResult[] = [];

  for (let i = 0; i < locations.length; i++) {
    const current = locations[i];

    if (i === 0) {
      // The first point has no previous point, so MIA is 0
      results.push({
        measuredDepth: Math.sqrt(current.north ** 2 + current.east ** 2 + current.tvd ** 2),
        inclination: 0,
        azimuth: 0,
        north: current.north,
        east: current.east,
        tvd: current.tvd,
        rf: 0,
        dls: 0,
        dogleg: 0,
      });
    } else {
      const previous = locations[i - 1];

      // Calculate the differences
      const deltaN = current.north - previous.north;
      const deltaE = current.east - previous.east;
      const deltaTVD = current.tvd - previous.tvd;

      // Measured Depth (MD)
      const measuredDepth = Math.sqrt(deltaN ** 2 + deltaE ** 2 + deltaTVD ** 2);

      // Inclination (I)
      const horizontalDisplacement = Math.sqrt(deltaN ** 2 + deltaE ** 2);
      const inclination = Math.atan2(horizontalDisplacement, deltaTVD) * (180 / Math.PI);

      // Azimuth (A) with Quadrant Adjustment
      let azimuth = Math.atan2(deltaE, deltaN) * (180 / Math.PI);

      // Adjust the azimuth based on the quadrant
      if (azimuth < 0) {
        // First or second quadrant but atan2 returned a negative value
        azimuth += 360;
      }

      // Apply Etaje's Nested Mapping to the first azimuth
      if (i === 1) {
        azimuth = applyEtajeMapping(azimuth);
      }

      // Radius of Curvature (RF)
      const rf = 1 / Math.tan(inclination * (Math.PI / 180));

      // Dogleg Severity (DLS) (assuming constant step sizes between measurements)
      const dls = Math.sqrt((inclination ** 2) + (azimuth ** 2)) / measuredDepth;

      // Dogleg
      const dogleg = Math.atan2(dls, rf) * (180 / Math.PI);

      results.push({
        measuredDepth,
        inclination,
        azimuth,
        north: current.north,
        east: current.east,
        tvd: current.tvd,
        rf,
        dls,
        dogleg,
      });
    }
  }

  return results;
}

  
  const miaResults = calculateMIAforLocations(interpolatedData);

  const convertToCSV = (miaResults:MIAResult) => {
    if (!Array.isArray(miaResults) || miaResults.length === 0) {
      console.error("miaResults is not a valid array or is empty.");
      return '';
    }
  
    const header = 'Point,MD (ft),Inclination (°),Azimuth (°)\n';
    const csvRows = miaResults.map((mia, index) => {
      return `${index + 1},${mia.measuredDepth.toFixed(2)},${mia.inclination.toFixed(2)},${mia.azimuth.toFixed(2)}`;
    });
    return header + csvRows.join('\n');
    
  };
  
  const handleExport = (miaResults:MIAResult) => {
    const csvData = convertToCSV(miaResults);
    if (csvData) {
      Share.share({
        title: 'MIA Results',
        message: 'MIA Results',
        url: 'data:text/csv;base64,' + btoa(csvData),
      }).catch((error) => console.error('Error sharing CSV:', error));
    } else {
      console.error("No CSV data to share.");
    }
  };

  // MIA DETERMINATION SETUP
  // Functions for calculating MIA and other parameters...
  const pairPlot2DParams = (param1:{title:string;placeholder:string},param2:{title:string;placeholder:string}) => {
    const param1Data = miaResults.map((mia:MIAResult,index:number) => mia[param1.placeholder] );
    const data1 = {data:param1Data,label:param1.title}
    const param2Data = miaResults.map((mia:MIAResult,index:number) => mia[param2.placeholder] );
    const data2 = {data:param2Data,label:param2.title}
    navigation.navigate(screens.Plot2DScreen,{axis1:data1,axis2:data2})

  }
  const handlePlot2D = () => {
    toggle2DModal();
    // Logic for plotting 2D graph
    //Alert.alert('Plotting 2D Graph', '2D graph will be plotted here.');
  };
  const [open2dModal,setOpen2Dmodal] = useState(false)
  const handlePlot3DFull = () => {
    // Validation logic here (similar to handlePlan)
    if (!surfaceLocation.north || !surfaceLocation.east || !surfaceLocation.tvd) {
      Alert.alert("Validation Error", "Please fill in all Surface Location fields.");
      return;
    }
  
    if (targets.length === 0) {
      Alert.alert("Validation Error", "Please add at least one Target Location.");
      return;
    }
  
    navigation.navigate(screens.NET_PLOTS, { interpolatedData});
  };
  
  const toggle2DModal = () => {
    setOpen2Dmodal(!open2dModal)
  }
  /*
  const handlePlot3D = () => {
    // Validation logic here (similar to handlePlan)
    if (!surfaceLocation.north || !surfaceLocation.east || !surfaceLocation.tvd) {
      Alert.alert("Validation Error", "Please fill in all Surface Location fields.");
      return;
    }
  
    if (targets.length === 0) {
      Alert.alert("Validation Error", "Please add at least one Target Location.");
      return;
    }
  
    navigation.navigate(screens.Plot3D, { surfaceLocation, targets, kop});
  };
*/
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}></Text>
        <TouchableOpacity onPress={() => handleExport(miaResults as any)} style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export MIA</Text>
        </TouchableOpacity>
      </View>

      {/* Surface and Target Locations Table*/}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Location</Text>
          <Text style={styles.headerText}>N (ft)</Text>
          <Text style={styles.headerText}>E (ft)</Text>
          <Text style={styles.headerText}>TVD (ft)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.rowText}>Surface Location</Text>
          <Text style={styles.rowValue}>{surfaceLocation.north}</Text>
          <Text style={styles.rowValue}>{surfaceLocation.east}</Text>
          <Text style={styles.rowValue}>{surfaceLocation.tvd}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.rowText}>KOP</Text>
          <Text style={styles.rowValue}>{surfaceLocation.north}</Text>
          <Text style={styles.rowValue}>{surfaceLocation.east}</Text>
          <Text style={styles.rowValue}>{kop}</Text>
        </View>
        {targets.map((target, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.rowText}>Target {index + 1}</Text>
            <Text style={styles.rowValue}>{target.north}</Text>
            <Text style={styles.rowValue}>{target.east}</Text>
            <Text style={styles.rowValue}>{target.tvd}</Text>
          </View>
        ))}
        
      </View>
      
      <ScrollView horizontal>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {showWellPath && <Text style={styles.headerText}>MD (ft)</Text>}
            {showWellPath && <Text style={styles.headerText}>Inc (°)</Text>}
            {showWellPath && <Text style={styles.headerText}>Azi (°)</Text>}
            {showXYZPath && <Text style={styles.headerText}>North (ft)</Text>}
            {showXYZPath && <Text style={styles.headerText}>East (ft)</Text>}
            {showXYZPath && <Text style={styles.headerText}>TVD (ft)</Text>}
            {showCurvature && <Text style={styles.headerText}>RF</Text>}
            {showBuildWalk && <Text style={styles.headerText}>DLS</Text>}
            {showBuildWalk && <Text style={styles.headerText}>Dogleg</Text>}
          </View>
          {miaResults.map((mia, index) => (
            <View style={styles.tableRow} key={index}>
              {showWellPath && <Text style={styles.rowValue}>{mia.measuredDepth.toFixed(2)}</Text>}
              {showWellPath && <Text style={styles.rowValue}>{mia.inclination.toFixed(2)}</Text>}
              {showWellPath && <Text style={styles.rowValue}>{mia.azimuth.toFixed(2)}</Text>}
              {showXYZPath && <Text style={styles.rowValue}>{mia.north}</Text>}
              {showXYZPath && <Text style={styles.rowValue}>{mia.east}</Text>}
              {showXYZPath && <Text style={styles.rowValue}>{mia.tvd}</Text>}
              {showCurvature && <Text style={styles.rowValue}>{mia?.rf?.toFixed(2)}</Text>}
              {showBuildWalk && <Text style={styles.rowValue}>{mia?.dls?.toFixed(2)}</Text>}
              {showBuildWalk && <Text style={styles.rowValue}>{mia.dogleg.toFixed(2)}</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelHeader}>Control Panel</Text>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>Well Path</Text>
          <Switch value={showWellPath} onValueChange={setShowWellPath} />
        </View>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>XYZ Path</Text>
          <Switch value={showXYZPath} onValueChange={setShowXYZPath} />
        </View>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>Curvature</Text>
          <Switch value={showCurvature} onValueChange={setShowCurvature} />
        </View>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>BuildWalk</Text>
          <Switch value={showBuildWalk} onValueChange={setShowBuildWalk} />
        </View>
      </View>
          {/* Modal drawer for Depth Interval input */}
   <Modal
  isVisible={open2dModal}
  onBackdropPress={() => setOpen2Dmodal(false)} // Close drawer on backdrop press
  style={styles.modal}
  swipeDirection="down"
  onSwipeComplete={() => setOpen2Dmodal(false)} // Allow swipe down to close
>
  <View style={styles.depthDrawer}>
    <Text style={styles.depthDrawerTitle}>Select Well Parameters</Text>
    <View style= {{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <View style={{width:300}}>
        <Picker
          style = {styles.selectButton}
          selectedValue={selectedValue}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
        <Picker.Item label="Select Parameter" value="" />
        {
          well_parameters.map((param,index) => {
            return <Picker.Item key={index} label={param.title} value={param.placeholder} />
          })
        }
      </Picker>
      </View>
      <Text>Vs</Text>
      <View style={{width:300}}>
          <Picker
          style = {styles.selectButton}
          selectedValue={secondAxis}
          onValueChange={(itemValue) => setSecondAxis(itemValue)}
        >
        <Picker.Item label="Select Parameter" value="" />
        {
          well_parameters.map((param,index) => {
            return <Picker.Item key={index} label={param.title} value={param.placeholder} />
          })
        }
      </Picker>
      </View>
    </View>
    {/* Buttons Row */}
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={styles.depthCloseButton}
        onPress={() => setOpen2Dmodal(false)}
      >
        <Text style={styles.depthCloseButtonText}>Close</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.depthContinueButton}
        onPress={() => {
          if(selectedValue && secondAxis){
            var axis1param = well_parameters.filter(data => data.placeholder == selectedValue)[0]
            var axis2param = well_parameters.filter(data=> data.placeholder == secondAxis)[0]
            pairPlot2DParams(axis1param,axis2param)
          }
        }}
      >
        <Text style={styles.depthContinueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.plotButton2D} onPress={handlePlot2D}>
          <Text style={styles.plotButtonText}>Plot 2D Graph</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plotButton3D} onPress={handlePlot3DFull}>
          <Text style={styles.plotButtonText}>Plot Full 3D Well Path</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
selectButton:{
        width:"auto",
        backgroundColor:'#F6F4F2',
        borderRadius:8,
        alignSelf:'stretch',
        paddingVertical:14,
        marginTop:5,
        paddingHorizontal:16,
        color:"#505050",
        fontWeight:'400',
        fontSize:14,
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
    marginTop:20,
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
   headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  exportButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  containersection: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  koplabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  kopoutputBox: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  kopoutputText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  table: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
  },
  rowText: {
    flex: 2,
    fontSize: 14,
    padding: 8,
    textAlign: 'left',
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    padding: 8,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'white',
    fontSize: 18,
  },
  controlPanel: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  controlPanelHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 16,
  },
  plotButton2D: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  plotButton3D: {
    flex: 1,
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  plotButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WellPlanScreen;
