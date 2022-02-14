import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';
import Dropzone from '../../components/Dropzone';

import './styles.css';
import logo from '../../assets/logo.svg';

// qnd criar um estado pra array ou objeto: manualmente informar o tipo da variavel
interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

export function CreatePoint() {
	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
	const [selectedFile, setSelectedFile] = useState<File>();
    
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		whatsapp: '',
	});

	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

	const history = useNavigate();

	useEffect (() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude } = position.coords;
			setInitialPosition([latitude, longitude]);
		});
	}, []);

	useEffect(() => { 
		api.get('items').then(response => {
			setItems(response.data);
		});
	}, []);

	useEffect(() => { 
		axios
			.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
			.then(response => {
				const ufInitials = response.data.map(uf => uf.sigla);

				setUfs(ufInitials);
			});
	}, []);

	useEffect(() => {
		if(selectedUf === '0') {
			return;
		}

		axios
			.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
			.then(response => {
				const cityNames = response.data.map(city => city.nome);

				setCities(cityNames);
			});
	} , [selectedUf]);

	function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;

		setSelectedUf(uf);
	}

	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;

		setSelectedCity(city);
	}

	function handleMapClick(event: LeafletMouseEvent) {
		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng,
		]);
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>){
		const { name, value } = event.target;

		setFormData({ ...formData, [name]: value });
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex(item => item === id);

		if (alreadySelected >= 0) {
			const filteredItems = selectedItems.filter(item => item  !== id);
			setSelectedItems(filteredItems);
		}

		else {
			setSelectedItems([ ...selectedItems, id ]);
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const { name, email, whatsapp } = formData;
		const uf = selectedUf;
		const city = selectedCity;
		const [ latitude, longitude ] = selectedPosition;
		const items = selectedItems;

		const data = new FormData();

		data.append('name', name);
		data.append('email', email);
		data.append('whatsapp', whatsapp);
		data.append('uf', uf);
		data.append('city', city);
		data.append('latitude', String(latitude));
		data.append('longitude', String(longitude));
		data.append('items', items.join(','));

		if (selectedFile) {
			data.append('image', selectedFile);
		}

		await api.post('points', data);

		alert('Ponto de coleta criado.');
		history('/');
	}

	// function LocationMarker() {
	// 	const map = useMapEvents({
	// 		click() {
	// 			map.locate();
	// 		},
	// 		locationfound(e) {
	// 			setSelectedPosition(e.latlng as any);
	// 			map.flyTo(e.latlng, map.getZoom());
	// 		},
	// 	});
	
	// 	return selectedPosition === null ? null : (
	// 		<Marker position={selectedPosition} />
	// 	);
	// }

	return (
		<div id='page-create-point'>
			<header>
				<img src={ logo } alt="Ecoleta" />

				<Link to='/'>
					<FiArrowLeft />
                    Voltar para home
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br /> ponto de coleta</h1>

				<Dropzone onFileUploaded={setSelectedFile} />

				<fieldset>
					<legend>
						<h2> Dados </h2>
					</legend>

					<div className='field'> 
						<label htmlFor="name"> Nome da entidade</label>
						<input 
							type="text"
							name="name"
							id="name"
							onChange={handleInputChange}
						/>
					</div>

					<div className="field-group">
						<div className='field'> 
							<label htmlFor="email"> E-mail</label>
							<input 
								type="email"
								name="email"
								id="email"
								onChange={handleInputChange}
							/>
						</div>

						<div className='field'> 
							<label htmlFor="name"> Whatsapp</label>
							<input 
								type="text"
								name="whatsapp"
								id="whatsapp"
								onChange={handleInputChange}
							/>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2> Endereço </h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<MapContainer center={initialPosition} zoom={5} onClick={handleMapClick}>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						<Marker position={selectedPosition}></Marker>
					</MapContainer>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf"> Estado (UF)</label>
							<select 
								name="uf" 
								id="uf"  
								value={selectedUf} 
								onChange={handleSelectUf}
							>
								<option value="0"> Selecione um UF</option>
								{ufs.map(uf => (
									<option key={uf} value={uf}> {uf}</option>
								))}
							</select>
						</div>
						<div className="field">
							<label htmlFor="city"> Cidade</label>
							<select 
								name="city" 
								id="city"
								value={selectedCity}
								onChange={handleSelectCity}
							>
								<option value="0"> Selecione uma cidade</option>
								{cities.map(city => (
									<option key={city} value={city}> {city}</option>
								))}
							</select>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2> Itens de coleta </h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>

					<ul className='items-grid'>
						{items.map(item =>(
							<li 
								key={item.id} 
								onClick={() => handleSelectItem(item.id)}
								className={selectedItems.includes(item.id) ? 'selected' : ''}
							>
								<img src={item.image_url} alt={item.title}/>
								<span>{item.title}</span>
							</li>
						))}
                        
					</ul>
				</fieldset>

				<button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
	);
}