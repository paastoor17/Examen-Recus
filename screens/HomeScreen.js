// Importación de librerías necesarias
import React, { useEffect, useState } from "react"; // Librería principal de React y hooks.
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, Image } from "react-native"; // Componentes de React Native.
import { collection, getDocs, addDoc, GeoPoint } from "firebase/firestore"; // Funciones para interactuar con Firestore.
import { db } from "../firebaseConfig"; // Configuración de Firebase personalizada.
import MapView, { Marker } from "react-native-maps"; // Componentes para mostrar mapas.
import { FAB, Modal, Portal, Provider as PaperProvider, TextInput, Button, IconButton } from 'react-native-paper'; // Componentes de UI de react-native-paper.
import * as ImagePicker from 'expo-image-picker'; // Permite seleccionar imágenes de la galería.

const HomeScreen = ({ navigation }) => {
  // Estado local para manejar datos, loading, modal y el formulario del nuevo POI.
  const [pois, setPois] = useState([]); // Lista de POIs (lugares de interés).
  const [loading, setLoading] = useState(true); // Estado de carga.
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal.
  const [newPOI, setNewPOI] = useState({ name: '', description: '', latitude: '', longitude: '', image: '' }); // Información del nuevo POI.

  // Función para obtener los POIs desde Firestore.
  const fetchPOIs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pois")); // Obtiene documentos de la colección "pois".
      const poisData = querySnapshot.docs.map((doc) => ({ // Mapea cada documento para estructurarlo.
        id: doc.id,
        ...doc.data(),
        coordinates: doc.data().coordinates ? {
          latitude: doc.data().coordinates.latitude,
          longitude: doc.data().coordinates.longitude
        } : null // Valida si tiene coordenadas.
      }));
      console.log("Fetched POIs:", poisData); // Log de los datos obtenidos.
      setPois(poisData); // Actualiza el estado con los POIs obtenidos.
    } catch (error) {
      console.error("Error fetching POIs:", error); // Muestra errores de la consulta.
    } finally {
      setLoading(false); // Detiene el indicador de carga.
    }
  };

  // useEffect para ejecutar fetchPOIs una sola vez al montar el componente.
  useEffect(() => {
    fetchPOIs();
  }, []);

  // Renderiza cada POI como una tarjeta interactiva.
  const renderPOI = ({ item }) => (
    <TouchableOpacity
      style={styles.poiCard}
      onPress={() => navigation.navigate('Details', { poi: item })} // Navega a la pantalla de detalles.
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <IconButton
        icon="chevron-right"
        color="#007AFF"
        size={24}
        onPress={() => navigation.navigate('Details', { poi: item })} // Acceso rápido al detalle.
      />
    </TouchableOpacity>
  );

  // Crea un nuevo POI y lo agrega a Firestore.
  const createNewPOI = async () => {
    try {
      const newCoordinates = new GeoPoint( // Convierte las coordenadas ingresadas a un objeto GeoPoint.
        parseFloat(newPOI.latitude),
        parseFloat(newPOI.longitude)
      );
      const docRef = await addDoc(collection(db, "pois"), { // Agrega el nuevo POI a la base de datos.
        name: newPOI.name,
        description: newPOI.description,
        coordinates: newCoordinates,
        image: newPOI.image || "https://via.placeholder.com/150" // Imagen por defecto si no se selecciona ninguna.
      });
      console.log("Document written with ID: ", docRef.id);
      setModalVisible(false); // Cierra el modal.
      setPois([...pois, { // Actualiza el estado local con el nuevo POI.
        id: docRef.id,
        ...newPOI,
        coordinates: {
          latitude: parseFloat(newPOI.latitude),
          longitude: parseFloat(newPOI.longitude)
        }
      }]);
      setNewPOI({ name: '', description: '', latitude: '', longitude: '', image: '' }); // Limpia el formulario.
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Abre la galería para seleccionar una imagen.
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes.
      allowsEditing: true, // Permite recorte.
      aspect: [4, 3], // Relación de aspecto.
      quality: 1, // Calidad máxima.
    });

    if (!result.canceled) { // Si el usuario selecciona una imagen, la actualiza en el formulario.
      setNewPOI({ ...newPOI, image: result.assets[0].uri });
    }
  };

  // Maneja el evento de clic en un marcador del mapa.
  const handleMarkerPress = (poi) => {
    navigation.navigate('Details', { poi });
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        {loading ? ( // Muestra un indicador mientras carga los POIs.
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <>
            {/* Mapa con marcadores */}
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 41.3851,
                longitude: 2.1734,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {pois.map((poi) => (
                poi.coordinates && (
                  <Marker
                    key={poi.id}
                    coordinate={poi.coordinates}
                    title={poi.name}
                    description={poi.description}
                    onPress={() => handleMarkerPress(poi)} // Navega al detalle al presionar.
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.marker} />
                    </View>
                  </Marker>
                )
              ))}
            </MapView>

            {/* Lista de POIs */}
            <FlatList
              data={pois}
              keyExtractor={(item) => item.id}
              renderItem={renderPOI}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
        {/* Botón flotante para agregar POIs */}
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setModalVisible(true)} // Abre el modal.
          color="white"
        />
        {/* Modal para agregar un nuevo POI */}
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New POI</Text>
            <TextInput
              label="Name"
              value={newPOI.name}
              onChangeText={(text) => setNewPOI({...newPOI, name: text})}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={newPOI.description}
              onChangeText={(text) => setNewPOI({...newPOI, description: text})}
              style={styles.input}
            />
            <TextInput
              label="Latitude"
              value={newPOI.latitude}
              onChangeText={(text) => setNewPOI({...newPOI, latitude: text})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Longitude"
              value={newPOI.longitude}
              onChangeText={(text) => setNewPOI({...newPOI, longitude: text})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Image URL"
              value={newPOI.image}
              onChangeText={(text) => setNewPOI({...newPOI, image: text})}
              style={styles.input}
            />
            <Button mode="outlined" onPress={pickImage} style={styles.imageButton}>
              Pick an image from gallery
            </Button>
            {newPOI.image && <Image source={{ uri: newPOI.image }} style={styles.imagePreview} />}
            <Button mode="contained" onPress={createNewPOI} style={styles.button}>
              Create POI
            </Button>
          </Modal>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: 300,
  },
  listContainer: {
    padding: 16,
  },
  poiCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666666",
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#007AFF',
  },
  imageButton: {
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
    borderRadius: 8,
  },
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default HomeScreen;
