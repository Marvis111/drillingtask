import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';

interface MyWebViewProps {
  northing: number[];
  easting: number[];
  tvd: number[];
  onLoadStart: () => void;
  onLoadEnd: () => void;
}

const MyWebView: React.FC<MyWebViewProps> = ({ northing, easting, tvd, onLoadStart, onLoadEnd }) => {
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
        var northing = ${JSON.stringify(northing)};
        var easting = ${JSON.stringify(easting)};
        var tvd = ${JSON.stringify(tvd)};

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
            width: 3,
            shape: 'spline', // Makes the line smoother
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
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      style={styles.webview}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
    />
  );
};

interface InterpolatedData {
  north: number;
  east: number;
  tvd: number;
}

interface NETPlotsScreenProps {
  route: {
    params: {
      interpolatedData: InterpolatedData[];
    };
  };
  navigation:any
}

const NETPlotsScreen: React.FC<NETPlotsScreenProps> = ({ route }) => {
  const { interpolatedData } = route.params;
  const [loading, setLoading] = useState(true);

  const northing = interpolatedData.map(target => target.north);
  const easting = interpolatedData.map(target => target.east);
  const tvd = interpolatedData.map(target => target.tvd);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <MyWebView
        northing={northing}
        easting={easting}
        tvd={tvd}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  webview: {
    flex: 1,
    width: '100%',
    height: Dimensions.get('window').height - 100, // Adjust this value to leave space for tab navigation
  },
});

export default NETPlotsScreen;
