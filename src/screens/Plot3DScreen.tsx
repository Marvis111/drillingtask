import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';

const MyWebView = () => {
    const htmlContent = `
     <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Well Path Trajectory</title>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
      </head>
      <body>
        <div id="myDiv" style="width: 100%; height: 100vh;"></div>
        <script>
          // Define the trajectory data
          var northing = [0, 0, 20, 300, 400, 500, 600, 700];
          var easting = [0, 0, 20, 35, 55, 80, 110, 145];
          var tvd = [0, 200, 300, 350, 500, 700, 900, 1150];
  
          // Create a scatter3d plot
          var trace = {
            x: northing,
            y: easting,
            z: tvd,
            mode: 'lines+markers',
            marker: {
              size: 5,
              color: 'rgb(0, 0, 255)',
            },
            line: {
              color: 'rgb(0, 0, 255)',
              width: 3
            },
            type: 'scatter3d'
          };
  
          var layout = {
            title: 'Well Path Trajectory',
            scene: {
              xaxis: { title: 'Northing (ft)' },
              yaxis: { title: 'Easting (ft)' },
              zaxis: { title: 'TVD (ft)', autorange: 'reversed' },
            },
            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 0
            }
          };
  
          var data = [trace];
  
          Plotly.newPlot('myDiv', data, layout, {scrollZoom: true});
        </script>
      </body>
      </html>
    `;
  
    return (
      <View style={{ flex: 1 }}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
        />
      </View>
    );
  };
const Plot3DScreen = ({  }) => {
  return (
    <View style={styles.container}>
      <Text>Plotting 3D Graph</Text>
      <MyWebView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height:1000
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default Plot3DScreen;
