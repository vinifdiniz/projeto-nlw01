import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
	ScrollView,
	Image,
	SafeAreaView,
	Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Item {
	id: number;
	titulo: string;
	image_url: string;
}
interface Points {
	id: number;
	name: string;
	image: string;
	image_url: string;
	latitude: number;
	longitude: number;
}
interface Parms {
	selectedUf: string;
	selectedCity: string;
}

const Points = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [initialPosition, setInitialPosition] = useState<[number, number]>([
		0,
		0,
	]);
	const [points, setPoints] = useState<Points[]>([]);
	const route = useRoute();
	const routeParms = route.params as Parms;

	useEffect(() => {
		async function loadPosition() {
			const { status } = await Location.requestPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert(
					'Ooops...',
					'Precisamos da sua localização para listar os pontos de coleta próximos a você.'
				);
				return;
			}
			const location = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = location.coords;
			setInitialPosition([latitude, longitude]);
		}
		loadPosition();
	}, []);
	useEffect(() => {
		api.get('items').then((response) => {
			setItems(response.data);
		});
	}, []);
	useEffect(() => {
		api
			.get('points', {
				params: {
					city: routeParms.selectedCity,
					uf: routeParms.selectedUf,
					items: selectedItems,
				},
			})
			.then((response) => {
				setPoints(response.data);
			});
	}, [selectedItems]);
	const navigation = useNavigation();
	function handleNavigateBack() {
		navigation.goBack();
	}
	function handleNatigateToDetail(id: number) {
		navigation.navigate('Detail', { point_id: id });
	}
	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex((item) => item === id);

		if (alreadySelected >= 0) {
			const filteredItems = selectedItems.filter((item) => item !== id);
			setSelectedItems(filteredItems);
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	}
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<TouchableOpacity onPress={handleNavigateBack}>
					<Icon name="arrow-left" size={20} color="#34cb79" />
				</TouchableOpacity>
				<Text style={styles.title}>Bem vindo.</Text>
				<Text style={styles.description}>
					Encontre no mapa um posto de coleta.
				</Text>
				<View style={styles.mapContainer}>
					{initialPosition[0] !== 0 && (
						<MapView
							style={styles.map}
							initialRegion={{
								latitude: initialPosition[0],
								longitude: initialPosition[1],
								latitudeDelta: 0.014,
								longitudeDelta: 0.014,
							}}
						>
							{points.map((point) => (
								<Marker
									key={String(point.id)}
									style={styles.mapMarker}
									coordinate={{
										latitude: point.latitude,
										longitude: point.longitude,
									}}
									onPress={() => handleNatigateToDetail(point.id)}
								>
									<View style={styles.mapMarkerContainer}>
										<Image
											style={styles.mapMarkerImage}
											source={{
												uri: point.image_url,
											}}
										/>
										<Text style={styles.mapMarkerTitle}>{point.name}</Text>
									</View>
								</Marker>
							))}
						</MapView>
					)}
				</View>
			</View>
			<View style={styles.itemsContainer}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 32 }}
				>
					{items.map((item) => (
						<TouchableOpacity
							activeOpacity={0.6}
							style={[
								styles.item,
								selectedItems.includes(item.id) ? styles.selectedItem : {},
							]}
							key={String(item.id)}
							onPress={() => handleSelectItem(item.id)}
						>
							<SvgUri width={42} height={42} uri={item.image_url} />
							<Text style={styles.itemTitle}>{item.titulo}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 32,
		paddingTop: 20,
	},

	title: {
		fontSize: 20,
		fontFamily: 'Ubuntu_700Bold',
		marginTop: 24,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 4,
		fontFamily: 'Roboto_400Regular',
	},

	mapContainer: {
		flex: 1,
		width: '100%',
		borderRadius: 10,
		overflow: 'hidden',
		marginTop: 16,
	},

	map: {
		width: '100%',
		height: '100%',
	},

	mapMarker: {
		width: 110,
	},

	mapMarkerContainer: {
		backgroundColor: '#34CB79',
		flexDirection: 'column',
		borderRadius: 8,
		overflow: 'hidden',
		alignItems: 'center',
	},

	mapMarkerImage: {
		width: '100%',
		height: 50,
		resizeMode: 'cover',
	},

	mapMarkerTitle: {
		flex: 1,
		fontFamily: 'Roboto_400Regular',
		color: '#FFF',
		fontSize: 13,
		lineHeight: 18,
		textAlign: 'center',
		padding: 5,
	},

	itemsContainer: {
		flexDirection: 'row',
		marginTop: 16,
	},

	item: {
		backgroundColor: '#fff',
		borderWidth: 2,
		borderColor: '#eee',
		height: 120,
		width: 120,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 16,
		marginRight: 8,
		alignItems: 'center',
		justifyContent: 'space-between',

		textAlign: 'center',
	},

	selectedItem: {
		borderColor: '#34CB79',
		borderWidth: 2,
	},

	itemTitle: {
		fontFamily: 'Roboto_400Regular',
		textAlign: 'center',
		fontSize: 13,
	},
});

export default Points;
