import React from 'react';
import { View, Text, StyleSheet, ScrollView,TouchableOpacity,Share,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import screens from '../navigations/screens';

interface CalculationTableProps {
  route: {
    params: {
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
}
const CalculationTable: React.FC<CalculationTableProps> = ({ route }) => {
  const { surfaceLocation, targets } = route.params;
  const combinedLocations = [
    surfaceLocation, // The first element is the surface location
    ...targets, // Spread the targets array to include each target as an individual element
  ];
  
  //KOP DETERMINATION SETUP
  type KOPParameters = {
    x: number; // Horizontal displacement component in the x-direction (e.g., 2500 feet)
    y: number; // Horizontal displacement component in the y-direction (e.g., -600 feet)
    tvd: number; // True Vertical Depth (TVD) to the target (e.g., 2400 feet)
    buildRate?: number; // Build Rate (BR) in degrees per 100 feet, default is 2 degrees
  };
  
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
  const kop = calculateKOP(kopParameters);
  const navigation = useNavigation();
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

  
        results.push({
          measuredDepth,
          inclination,
          azimuth,
        });
      }
    }
  
    return results;
  }
  
  const miaResults = calculateMIAforLocations(combinedLocations);

  const convertToCSV = (miaResults) => {
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
  
  const handleExport = (miaResults) => {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Analysis Breakdown</Text>
        <TouchableOpacity onPress={() => handleExport(miaResults)} style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export MIA</Text>
        </TouchableOpacity>
      </View>

      {/* Surface and Target Locations Table */}
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
        {targets.map((target, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.rowText}>Target {index + 1}</Text>
            <Text style={styles.rowValue}>{target.north}</Text>
            <Text style={styles.rowValue}>{target.east}</Text>
            <Text style={styles.rowValue}>{target.tvd}</Text>
          </View>
        ))}
        
      </View>
      <View style={styles.containersection}>
        <Text style={styles.koplabel}>Calculated Kick-Off Point (KOP):</Text>
        <View style={styles.kopoutputBox}>
          <Text style={styles.kopoutputText}>{kop.toFixed(2)} feet</Text>
        </View>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Location</Text>
          <Text style={styles.headerText}>MD (ft)</Text>
          <Text style={styles.headerText}>I (°)</Text>
          <Text style={styles.headerText}>A (°)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.rowText}>Surface Location</Text>
          <Text style={styles.rowValue}>{miaResults[0].measuredDepth.toFixed(2)}</Text>
          <Text style={styles.rowValue}>{miaResults[0].inclination.toFixed(2)}</Text>
          <Text style={styles.rowValue}>{miaResults[0].azimuth.toFixed(2)}</Text>
        </View>
        {miaResults.slice(1).map((mia, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.rowText}>Target {index + 1}</Text>
            <Text style={styles.rowValue}>{mia.measuredDepth.toFixed(2)}</Text>
            <Text style={styles.rowValue}>{mia.inclination.toFixed(2)}</Text>
            <Text style={styles.rowValue}>{mia.azimuth.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.containersection}>
        <TouchableOpacity style={styles.kopoutputBox} onPress={handlePlot3D}>
          <Text style={styles.kopoutputText}>Plot 3D Graph</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    display:'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width:'100%',
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
    width:'100%',
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
});

export default CalculationTable;
