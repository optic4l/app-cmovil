import React, { useState, useEffect, useRef } from "react";
import { Camera, CameraType, FlashMode } from "expo-camera";
import * as Location from "expo-location";
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { useVariablesContext } from "../contexts/VariablesContext";
export default function CamaraScreen({ navigation }: any) {

  const { 
    loading,
    setLoading
   } = useVariablesContext();

  //------------------------SET GENERALES--------------------------
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  let camaraRef = useRef<any>(null);
  const [address, setAdress] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [disabled, setDisabled] = useState(false);
  const [statusLocation, requestPermissionLocation] =
    Location.useForegroundPermissions();

  //------------------------FUNCIONES PRINCIPALES--------------------------

  //------------------------PROCESOS--------------------------
  const tomarFoto = async () => {
    if (camaraRef && camaraRef.current) {
      try {
        setDisabled(true);
        const data = await camaraRef.current.takePictureAsync();
        if (address && address != "") {
          navigation.pop();
          navigation.navigate("PrePost", {
            uri: data.uri,
            address: address,
            coords: location,
          });
        }
      } catch (error) {}
    }
  };
  const tomandoLocalizacion = async () => {
    //console.log("Permisos location: ", statusLocation);
    let coordenadas: Location.LocationObject;
    let address: any;
    try {
      coordenadas = await Location.getCurrentPositionAsync({});
      address = await Location.reverseGeocodeAsync(coordenadas.coords);
      setAdress(
        `${address[0].street} ${address[0].streetNumber}, ${address[0].city}, ${address[0].region}, ${address[0].country}`
      );
      setLocation(coordenadas.coords);
      console.log("Localizacion completa");
    } catch (error) {
      console.error(error);
    }
  };
  const recargaCam = () => {
    if (camaraRef.current !== null) {
      //console.log("Camara: ", camaraRef);
      camaraRef.current.resumePreview();
      console.log("Recamara completa");
    }
  };
  useEffect(() => {
    recargaCam();
    setLoading(false);
  }, []);
  useEffect(() => {
    (async () => {
      if (statusLocation) await tomandoLocalizacion();
    })();
  }, [statusLocation]);
  if (!permission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "center",
          paddingHorizontal: 30,
          backgroundColor: "#000",
        }}
      >
        <Text style={{ textAlign: "center", marginBottom: 10, color: "#fff" }}>
          Se necesitan permisos para acceder a la camara y su locación
        </Text>
        <Button
          onPress={() => {
            requestPermission();
            requestPermissionLocation();
          }}
          title="Dar Permisos"
        />
      </View>
    );
  } else if (loading) {
    return (
      <View>
        <Text>Cargando...</Text>
      </View>
    );
  } else if (!loading) {
    //console.log("return");

    return (
      <View style={styles.contenedorPrincipal}>
        <Camera
          style={styles.camara}
          type={type}
          flashMode={flash}
          ref={camaraRef}
          ratio="16:9"
        ></Camera>
        <View style={styles.footerBotonesCamara}>
          <TouchableOpacity
            onPress={tomarFoto}
            style={{ marginHorizontal: 60 }}
            disabled={disabled}
          >
            <FontAwesomeIcon
              icon={faCircle}
              size={70}
              color={!disabled ? "#fff" : "#707070"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: "transparent",
  },
  footerBotonesCamara: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
    grow: 10,
    marginBottom: 50,
    zIndex: 9999,
    alignItems: "center",
  },
  camara: {
    flex: 1,
    borderWidth: 2,
  },
});
