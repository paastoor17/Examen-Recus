import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';

const DetailScreen = ({ route, navigation }) => {
  const { poi } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: poi.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{poi.name}</Text>
          <Text style={styles.description}>{poi.description}</Text>
          {poi.coordinates && (
            <Text style={styles.coordinates}>
              Latitude: {poi.coordinates.latitude.toFixed(4)}, Longitude: {poi.coordinates.longitude.toFixed(4)}
            </Text>
          )}
        </View>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Back to Map
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  textContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#888888',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#007AFF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetailScreen;

