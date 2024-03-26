import React from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Popup} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import Autosuggest from 'react-autosuggest';
import '../index.css';
import helpers from'./helpers'

class TCExplore extends React.Component {

	constructor(props) {
		document.title = 'Argovis - Explore tropical cyclones'
		super(props);

		let q = new URLSearchParams(window.location.search) // parse out query string

		// limits for polygon / time coupling
		this.minDays = 30 // note the url construction always allows for one extra day than endDate-startDate
		this.maxDays = 365
		this.minArea = 1000000
		this.maxArea = 10000000
		this.defaultDayspan = 30

		// default state, pulling in query string specifications
		this.state = {
			observingEntity: false,
			apiKey: localStorage.getItem('apiKey') ? localStorage.getItem('apiKey') : 'guest',
			tcNameSuggestions: [],
			tcName: q.has('tcName') ? q.get('tcName') : '',
			refreshData: false,
			points: [],
			polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : [],
			interpolated_polygon: q.has('polygon') ? helpers.insertPointsInPolygon(JSON.parse(q.get('polygon'))) : [],
			urls: [],
			centerlon: q.has('centerlon') ? parseFloat(q.get('centerlon')) : -70,
			mapkey: Math.random()
		}
		this.state.maxDayspan = helpers.calculateDayspan.bind(this)(this.state)

		helpers.mungeTime.bind(this)(q, this.state.maxDayspan, '2020-08-31')

        // some other useful class variables
        this.fgRef = React.createRef()
        this.formRef = React.createRef()
        this.nameRef = React.createRef()
		this.statusReporting = React.createRef()
		this.reautofocus = null
        this.apiPrefix = 'https://argovis-api.colorado.edu/'
        this.vocab = {}
        this.lookupLabel = {}
        this.dataset = 'tc'
        this.customQueryParams =  ['startDate', 'endDate', 'polygon', 'tcName', 'centerlon']

        // populate vocabularies, and trigger first render
        fetch(this.apiPrefix + 'summary?id=tc_labels', {headers:{'x-argokey': this.state.apiKey}})
        .then(response => response.json())
        .then(data => {
        	if(data[0].hasOwnProperty('code') && data[0].code === 401){
					helpers.manageStatus.bind(this)('error', 'Invalid API key; see the "Get a free API key" link below.')
			} else {
	        	this.vocab['tcName'] = data[0].summary.map(x=>x.label)
	        	this.lookupLabel = {}
	        	for(let i=0; i<data[0].summary.length; i++){
	        		this.lookupLabel[data[0].summary[i].label] = data[0].summary[i]._id
	        	}
	        	this.setState({refreshData:true})
	        }
        })
	}

    componentDidUpdate(prevProps, prevState, snapshot){
    	helpers.componentDidUpdate.bind(this)()
    }

    lookingForEntity(state){
    	// return true if any token, valid or not, is specified for any entity query string parameter
    	return Boolean(state.tcName)
    }

    generateURLs(state){
    	if(state.tcName !== ''){
    		return [this.apiPrefix +'tc?compression=minimal&metadata=' + this.lookupLabel[state.tcName]]
    	} else {
    		return [helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'tc', state)]
    	}
    }	

    chooseColor(point){
    	return 'red'
    }

    genTooltip(point, state){
    	// given an array <point> corresponding to a single point returned by an API data route with compression=minimal,
    	// return the jsx for an appropriate tooltip for this point.

    	let regionLink = helpers.genRegionLink(state.polygon, state.startDate, state.endDate, state.centerlon, 'tc')

    	return(
		    <Popup>
		      ID: {point[0]} <br />
		      Long / Lat: {helpers.mungePrecision(point[1])} / {helpers.mungePrecision(point[2])} <br />
		      Date: {point[3]} <br />
		      <a target="_blank" rel="noreferrer" href={'/plots/tc?showAll=true&tcMeta='+point[0].split('_')[0]+'&centerlon='+this.state.centerlon}>Cyclone Page</a>
		      {regionLink}
		    </Popup>
    	)
    }

    dateRangeMultiplyer(s){
    	// allowed date range will be multiplied by this much, as a function of the mutated state s
    	return 1
    }

    toggleCoupling(s){
    	// if changing a toggle for this page needs to trigger a side effect on state, do so here.
    	return s
    }

	render(){
		console.log(this.state)
		return(
			<>
				<div style={{'width':'100vw', 'textAlign': 'center', 'padding':'0.5em', 'fontStyle':'italic'}} className='d-lg-none'>Use the right-hand scroll bar to scroll down for search controls</div>
				<div className='row' style={{'width':'100vw'}}>
					<div className='col-lg-3 order-last order-lg-first'>
						<fieldset ref={this.formRef}>
							<span id='statusBanner' ref={this.statusReporting} className='statusBanner busy'>Downloading...</span>
							<div className='mapSearchInputs scrollit' style={{'height':'90vh'}}>
								<h5>Explore Tropical Cyclones</h5>
								<div className='verticalGroup'>
									<div className="form-floating mb-3">
										<input type="password" className="form-control" id="apiKey" value={this.state.apiKey} placeholder="" onInput={(v) => helpers.setToken.bind(this)('apiKey', v.target.value, null, true)}></input>
										<label htmlFor="apiKey">API Key</label>
										<div id="apiKeyHelpBlock" className="form-text">
						  					<a target="_blank" rel="noreferrer" href='https://argovis-keygen.colorado.edu/'>Get a free API key</a>
										</div>
									</div>
									<h6>Time Range</h6>
									<div className="form-floating mb-3">
										<input 
											type="date" 
											disabled={this.state.observingEntity} 
											className="form-control" 
											id="startDate" 
											value={this.state.startDate} 
											placeholder="" 
											onChange={v => helpers.setDate.bind(this)('startDate', v.target.valueAsNumber, this.state.maxDayspan, false, true)}
											onBlur={e => helpers.setDate.bind(this)('startDate', e.target.valueAsNumber, this.state.maxDayspan, false, false)}
											onKeyPress={e => {if(e.key==='Enter'){helpers.setDate.bind(this)('startDate', e.target.valueAsNumber, this.state.maxDayspan, false, false)}}}
										/>
										<label htmlFor="startDate">Start Date</label>
									</div>
									<div className="form-floating mb-3">
										<input 
											type="date" 
											disabled={this.state.observingEntity} 
											className="form-control" 
											id="startDate" 
											value={this.state.endDate} 
											placeholder="" 
											onChange={v => helpers.setDate.bind(this)('endDate', v.target.valueAsNumber, this.state.maxDayspan, false, true)}
											onBlur={e => helpers.setDate.bind(this)('endDate', e.target.valueAsNumber, this.state.maxDayspan, false, false)}
											onKeyPress={e => {if(e.key==='Enter'){helpers.setDate.bind(this)('endDate', e.target.valueAsNumber, this.state.maxDayspan, false, false)}}}
										/>
										<label htmlFor="endDate">End Date</label>
									</div>
									<div id="dateRangeHelp" className="form-text">
					  					<p>Max day range: {this.state.maxDayspan+1}</p>
									</div>
								</div>

								<h6>Map Center Longitude</h6>
									<div className="form-floating mb-3">
										<input 
											id="centerlon"
											type="text"
											disabled={this.state.observingEntity} 
											className="form-control" 
											placeholder="0" 
											value={this.state.centerlon} 
											onChange={e => {
												helpers.manageStatus.bind(this)('actionRequired', 'Hit return or click outside the current input to update.')
												this.setState({centerlon:e.target.value})}
											} 
											onBlur={e => {
												this.setState({centerlon: helpers.manageCenterlon(e.target.defaultValue), mapkey: Math.random(), refreshData: true})
											}}
											onKeyPress={e => {
												if(e.key==='Enter'){
													this.setState({centerlon: helpers.manageCenterlon(e.target.defaultValue), mapkey: Math.random(), refreshData: true})
												}
											}}
											aria-label="centerlon" 
											aria-describedby="basic-addon1"/>
										<label htmlFor="depth">Center longitude on [-180,180]</label>
									</div>

								<div className='verticalGroup'>
									<h6>Object Filters</h6>
									<div className="form-floating mb-3">
			      						<Autosuggest
									      	id='tcNameAS'
									      	ref={this.nameRef}
									        suggestions={this.state.tcNameSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'tcNameSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'tcNameSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'tcName')}
									        inputProps={{placeholder: 'TC Name', value: this.state.tcName, onChange: helpers.onAutosuggestChange.bind(this, 'Check value of TC Name', 'tcName', this.nameRef), id: 'tcName'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item autocomplete-item'}}
			      						/>
									</div>
									<a className="btn btn-primary" href="/tc" role="button">Reset Map</a>
								</div>
							</div>
						</fieldset>
					</div>

					{/*leaflet map*/}
					<div className='col-lg-9'>
						<MapContainer key={this.state.mapkey} center={[25, parseFloat(this.state.centerlon)]} maxBounds={[[-90,this.state.centerlon-180],[90,this.state.centerlon+180]]} zoomSnap={0.01} zoomDelta={1} zoom={2.05} minZoom={2.05} scrollWheelZoom={true}>
							<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<FeatureGroup ref={this.fgRef}>
								<EditControl
								position='topleft'
								onCreated={p => helpers.onPolyCreate.bind(this)(p)}
								onDeleted={p => helpers.onPolyDelete.bind(this)([],p)}
								onDrawStop={p => helpers.onDrawStop.bind(this)(p)}
								onDrawStart={p => helpers.onDrawStart.bind(this)(p)}
								draw={{
									rectangle: false,
									circle: false,
									polyline: false,
									circlemarker: false,
									marker: false,
									polygon: this.state.observingEntity ? false: {
										shapeOptions: {
											fillOpacity: 0
										}
									}
								}}
								edit={{
									edit: false
								}}
								/>
								<Polygon key={Math.random()} positions={this.state.interpolated_polygon.map(x => [x[1],x[0]])} fillOpacity={0}></Polygon>
							</FeatureGroup>
							{this.state.points}
						</MapContainer>
					</div>
				</div>
			</>
		)
	}
}

export default TCExplore