import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import WebView from 'react-native-webview';



const Plot2DScreen: React.FC = ({route,navigation}) => {
  const [loading,setLoading] = useState(false)
  const {axis1,axis2} = (route.params);
  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <MyWebView
        axis1={axis1} axis2={axis2}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      <TouchableOpacity onPress={()=>{
        navigation.goBack()
      }} style={{position:"absolute",bottom:5,right:5,paddingVertical:5,paddingHorizontal:10,backgroundColor:'grey',borderRadius:5}}>
        <Text style={{color:"white"}}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};
interface MyWebViewProps {
  axis1:any;
  axis2:any;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}

const MyWebView: React.FC<MyWebViewProps> = ({ axis1,axis2, onLoadStart, onLoadEnd }) => {
  const htmlContent = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2D Graph of ${axis1?.label}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="myDiv" style="width: 100%; height: 100vh;"></div>
    <script>
        var trace1 = {
            x: [${axis1.data}],
            y: [${axis2.data}],
            mode: 'lines',
            name: 'Line Plot'
        };
        
        var layout = {
            title: '2D Graph of ${axis1.label} against ${axis2.label}',
            xaxis: {
                title: '${axis1.label}'
            },
            yaxis: {
                title: '${axis2.label}'
            }
        };
        
        var data = [trace1];
        Plotly.newPlot('myDiv', data, layout);
    </script>
</body>
</html>`;
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    width: '100%',
    height: Dimensions.get('window').height - 100, // Adjust this value to leave space for tab navigation
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2 - 40,
    left: Dimensions.get('window').width / 2 - 20,
    zIndex: 1,
  },
});

export default Plot2DScreen;
