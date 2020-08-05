import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Image, StyleSheet, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface IBGEUFResponse {
	sigla: string;
}
interface IBGECityResponse {
	nome: string;
}

const Home = () => {
	const navigation = useNavigation();
	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCitys] = useState<string[]>([]);
	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');
	useEffect(() => {
		axios
			.get<IBGEUFResponse[]>(
				'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
			)
			.then((response) => {
				const ufInitial = response.data.map((uf) => uf.sigla);
				setUfs(ufInitial);
			});
	}, []);
	useEffect(() => {
		axios
			.get<IBGECityResponse[]>(
				`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
			)
			.then((response) => {
				const cityNames = response.data.map((city) => city.nome);
				setCitys(cityNames);
			});
	}, [selectedUf]);

	function handleNavigationToPoints() {
		navigation.navigate('Points', { selectedUf, selectedCity });
	}

	return (
		<ImageBackground
			source={require('../../assets/home-background.png')}
			style={styles.container}
			imageStyle={{ width: 274, height: 368 }}
		>
			<View style={styles.main}>
				<Image source={require('../../assets/logo.png')} />
				<Text style={styles.title}>Seu Marketplace de coleta de resíduos</Text>
				<Text style={styles.description}>
					Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
				</Text>
			</View>
			<View style={styles.footer}>
				<RNPickerSelect
					style={{
						...pickerSelectStyles,
						iconContainer: { top: 15, right: 15 },
					}}
					onValueChange={(value) => setSelectedUf(value)}
					placeholder={{
						label: 'Selecione uma UF',
						value: '0',
					}}
					value={selectedUf}
					Icon={() => <Icon name="chevron-down" color="#000" size={24} />}
					doneText="Selecionar"
					items={ufs.map((uf) => ({ label: uf, value: uf }))}
				/>
				<RNPickerSelect
					style={{
						...pickerSelectStyles,
						iconContainer: { top: 15, right: 15 },
					}}
					onValueChange={(value) => setSelectedCity(value)}
					placeholder={{
						label: 'Selecione uma Cidade',
						value: '0',
					}}
					value={selectedCity}
					Icon={() => <Icon name="chevron-down" color="#000" size={24} />}
					doneText="Selecionar"
					items={cities.map((city) => ({ label: city, value: city }))}
				/>
				<RectButton style={styles.button} onPress={handleNavigationToPoints}>
					<View style={styles.buttonIcon}>
						<Icon name="arrow-right" color="#FFF" size={24} />
					</View>
					<Text style={styles.buttonText}>Entrar</Text>
				</RectButton>
			</View>
		</ImageBackground>
	);
};

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		backgroundColor: '#FFF',
		height: 60,
		paddingHorizontal: 30,
		marginBottom: 8,
		fontSize: 16,
	},
	inputAndroid: {
		backgroundColor: '#FFF',
		height: 60,
		paddingHorizontal: 30,
		marginBottom: 8,
		fontSize: 16,
	},
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
	},

	main: {
		flex: 1,
		justifyContent: 'center',
	},

	title: {
		color: '#322153',
		fontSize: 32,
		fontFamily: 'Ubuntu_700Bold',
		maxWidth: 260,
		marginTop: 64,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 16,
		fontFamily: 'Roboto_400Regular',
		maxWidth: 260,
		lineHeight: 24,
	},

	footer: {},

	select: {},

	input: {
		height: 60,
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 8,
		paddingHorizontal: 24,
		fontSize: 16,
	},

	button: {
		backgroundColor: '#34CB79',
		height: 60,
		flexDirection: 'row',
		borderRadius: 10,
		overflow: 'hidden',
		alignItems: 'center',
		marginTop: 8,
	},

	buttonIcon: {
		height: 60,
		width: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonText: {
		flex: 1,
		justifyContent: 'center',
		textAlign: 'center',
		color: '#FFF',
		fontFamily: 'Roboto_500Medium',
		fontSize: 16,
	},
});

export default Home;
