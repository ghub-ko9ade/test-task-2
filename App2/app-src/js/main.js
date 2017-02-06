'use strict';

/*
* Для сохранения удобной возможности легко смотреть это в браузере
* не будем дробить это на отдельные файлы модулей.
*
* Для просмотра в браузере (browse.html) закоментировать все импорты
* и раскоментирорвать две константы под ними.
*/
import React/*, {Component}*/ from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import /* * as ReactRedux*/ {Provider, connect as reduxConnect} from 'react-redux';
import '../css/main.css';
//const {Provider} = ReactRedux;
//const reduxConnect = ReactRedux.connect;



const config = {
	// Урл внешнего файла с данными о перелётах
	dataSrc: 'data.json'
};



class FlightAppCls extends React.Component {
	constructor (props) {
		super(props);
		this.state = {flights:[]/*, carrier:null*/};
	}

	componentDidMount () {
		fetch(config.dataSrc, {}).then(response => {
			if (response.ok) {
				return response.json();//promise
			}
			else {
				this._err('NetworkError: ' + response.status + ' ' + response.statusText + ' ' + response.url);
			}
		}, err => this._err(err)).then(data => {
			if (data) {
				if (Array.isArray(data.flights)) {
					let flights = data.flights;
					// Отсортировать, если нет строгой уверенности, что они уже отсортированы...
					flights.sort((a, b) => a.arrival < b.arrival ? -1 : (a.arrival == b.arrival ? (a.departure < b.departure ? -1 : (a.departure == b.departure ? 0 : 1)) : 1));
					this.setState({flights:flights});
				}
				else {
					this._err('ServerError: No valid data');
				}
			}
		});
	}

	_err (err) {
		console.log(err);
	}

	/*onChangeCarrier (evt) {
		evt.stopPropagation();
		this.setState({carrier:evt.target.value});
	}*/

	render () {
		let flights = this.state.flights;
		let carrier = this.props/*state*/.carrier;
		let carriers = flights.length ? flights.reduce((result, item) => {
			if (result.indexOf(item.carrier) == -1) {
				result.push(item.carrier);
			}
			return result;
		}, []) : [];
		carriers.sort();
		return (
			<Provider store={this.props.store}>
				<div className="flight-app">
					<div className="flight-title">Выберите авиакомпанию:</div>
					<FlightSelector list={carriers} current={carrier} onChange={this.props.changeCarrier/*this.onChangeCarrier.bind(this)*/} />
					<FlightList flights={flights} carrier={carrier} />
				</div>
			</Provider>
		);
	}
}

const mapperStoreStateToProps = function (store) {
	return {
		carrier: store.flightApp.carrier
	};
}

const mapperDispatchToProps = function (dispatch, props) {
	return {
		changeCarrier: function (evt) {
			dispatch({type:'CHANGE_CARRIER', carrier:evt.target.value});
		}
	}
}

const FlightApp = reduxConnect(mapperStoreStateToProps, mapperDispatchToProps)(FlightAppCls);



const FlightSelector = function (props) {
	let {list, current, onChange} = props;
	return (
		<select className="flight-selector" value={current || ''} onChange={onChange}>
			<option value="">Все авиакомании</option>
			{list.length ? list.map(item => <option value={item}>{item}</option>) : null}
		</select>
	);
}



const FlightList = function (props) {
	let {flights, carrier} = props;
	let list = flights.length ? (carrier ? flights.filter(item => item.carrier == carrier) : flights) : [];
	return (
		<div className={'flight-list' + (list.length ? '' : ' empty')}>
			{list.length ? list.map(item => <FlightEntry {...item} />) : 'Нет данных...'}
		</div>
	);
}



const FlightEntry = function (entry) {
	let dt1 = new Date(entry.arrival);
	let dt2 = new Date(entry.departure);
	let f = (t) => {
		let h = t.getHours(), m = t.getMinutes();
		return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
	};
	return (
		<div className="flight-entry">
			<div className="flight-entry-id">рейс № <span>{entry.id}</span></div>
			<div className="flight-entry-direction">{entry.direction.from} - {entry.direction.to}</div>
			<div className="flight-entry-arrival">Вылет <span className="date">{dt1.toLocaleDateString()}</span> в <span className="time">{f(dt1)}</span></div>
			<div className="flight-entry-departure">Прилёт <span className="date">{dt2.toLocaleDateString()}</span> в <span className="time">{f(dt2)}</span></div>
			<div className="flight-entry-carrier">Авиакомпания <span>{entry.carrier}</span></div>
		</div>
	);
}



const createStore = function (initData) {
	let initStates = {flightApp:{carrier:null}};
	let reducers = {
		flightApp: function (state = initStates.flightApp, action) {
			switch(action.type) {
				case 'CHANGE_CARRIER':
					return {...state, carrier:action.carrier};
				default:
					return state;
			}
		}
	};

	let r = Redux.combineReducers(reducers);
	/*let store = Redux.applyMiddleware(...)(Redux.createStore)(r, initData);*/
	let store = Redux.createStore(r, initData);
	return store;
}

const store = createStore();



ReactDOM.render(
	<FlightApp store={store} />,
	document.getElementById('react-root')
);
