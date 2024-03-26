import React from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Popup} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import Autosuggest from 'react-autosuggest';
import '../index.css';
import helpers from'./helpers'

class ArgoExplore extends React.Component {

	constructor(props) {
		document.title = 'Argovis - Explore Argo profiles'
		super(props);

		let q = new URLSearchParams(window.location.search) // parse out query string

		// limits for polygon / time coupling
		this.minDays = 10
		this.maxDays = 365
		this.minArea = 1000000
		this.maxArea = 10000000
		this.defaultDayspan = 10

		// default state, pulling in query string specifications
		this.state = {
			observingEntity: false,
			apiKey: localStorage.getItem('apiKey') ? localStorage.getItem('apiKey') : 'guest',
			argocore: q.has('argocore') ? q.get('argocore') === 'true' : false,
			argobgc: q.has('argobgc') ? q.get('argobgc') === 'true' : false,
			argodeep: q.has('argodeep') ? q.get('argodeep') === 'true' : false,
			argoPlatformSuggestions: [],
			argoPlatform: q.has('argoPlatform') ? q.get('argoPlatform') : '',
			refreshData: true,
			points: [],
			polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : [],
			interpolated_polygon: q.has('polygon') ? helpers.insertPointsInPolygon(JSON.parse(q.get('polygon'))) : [],
			urls: [],
			depthRequired: q.has('depthRequired') ? q.get('depthRequired') : 0,
			centerlon: q.has('centerlon') ? parseFloat(q.get('centerlon')) : -160,
			mapkey: Math.random(),
			nCore: 0,
			nBGC: 0,
			nDeep: 0
		}

		this.state.maxDayspan = helpers.calculateDayspan.bind(this)(this.state)

		helpers.mungeTime.bind(this)(q, this.state.maxDayspan)

        // if no query string specified at all or no categories selected turn on all argo categories
        if(!window.location.search || (!q.has('argocore') && !q.has('argobgc') && !q.has('argodeep')) ){
        	console.log('imposing defaults')
        	this.state.argocore = true
        	this.state.argobgc = true
        	this.state.argodeep = true
        }

        // some other useful class variables
        this.fgRef = React.createRef()
        this.formRef = React.createRef()
        this.platformRef = React.createRef()
		this.statusReporting = React.createRef()
		this.reautofocus = null
        this.apiPrefix = 'https://argovis-api.colorado.edu/'
        this.vocab = {}
        this.dataset = 'argo'
        this.customQueryParams = ['startDate', 'endDate', 'polygon', 'argocore', 'argobgc', 'argodeep', 'argoPlatform', 'depthRequired', 'centerlon']

        // populate vocabularies, and trigger first render
        let vocabURLs = [this.apiPrefix + 'argo/vocabulary?parameter=platform', this.apiPrefix + 'argo/overview']
		Promise.all(vocabURLs.map(x => fetch(x, {headers:{'x-argokey': this.state.apiKey}}))).then(responses => {
			Promise.all(responses.map(res => res.json())).then(data => {
				if(data[0].hasOwnProperty('code') && data[0].code === 401){
					helpers.manageStatus.bind(this)('error', 'Invalid API key; see the "Get a free API key" link below.')
				} else {
					this.vocab['argoPlatform'] = data[0]
					this.setState({
						refreshData:true,
						nCore: data[1][0].summary.nCore,
						nBGC: data[1][0].summary.nBGC,
						nDeep: data[1][0].summary.nDeep
					})
				}
			})
		})

	}

    componentDidUpdate(prevProps, prevState, snapshot){
    	helpers.componentDidUpdate.bind(this)()
    }

    lookingForEntity(state){
    	// return true if any token, valid or not, is specified for any entity query string parameter
    	return Boolean(state.argoPlatform)
    }

    generateURLs(state) {
    	if(state.argoPlatform !== ''){
    		return [this.apiPrefix +'argo?compression=minimal&platform=' + state.argoPlatform]
    	} else {

	    	let url = helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'argo', state)	

	    	// decide on source.source
	    	let source = []
	    	if(!state.argocore && !state.argobgc && !state.argodeep){
	    		return []
	    	} else if(state.argocore && state.argobgc && state.argodeep){
	    		source = ['argo_core']
	    	} else if(state.argocore && state.argobgc && !state.argodeep){
	    		source = ['argo_core,~argo_deep', 'argo_bgc']
	    	} else if(state.argocore && !state.argobgc && state.argodeep){
	    		source = ['argo_core,~argo_bgc', 'argo_deep']
	    	} else if(!state.argocore && state.argobgc && state.argodeep){
	    		source = ['argo_bgc', 'argo_deep']
	    	} else if(state.argocore && !state.argobgc && !state.argodeep){
	    		source = ['argo_core,~argo_bgc,~argo_deep']
	    	} else if(!state.argocore && state.argobgc && !state.argodeep){
	    		source = ['argo_bgc']
	    	} else if(!state.argocore && !state.argobgc && state.argodeep){
	    		source = ['argo_deep']
	    	}

	    	if(source.length === 0){
	    		url = [url]
	    	} else{
	    		url = source.map(x => url+'&source='+x)
	    	}
	    	console.log(url)
	    	return url
	    }
    }

    chooseColor(point){
    	if(point[4].includes('argo_bgc')){
    		return 'green'
    	}
    	else if(point[4].includes('argo_deep')){
    		return 'blue'
    	}
    	else if(point[4].includes('argo_core')){
	    	return 'yellow'
	    }
    }

    genTooltip(point, state){
    	// given an array <point> corresponding to a single point returned by an API data route with compression=minimal,
    	// return the jsx for an appropriate tooltip for this point.

    	let regionLink = helpers.genRegionLink(state.polygon, state.startDate, state.endDate, state.centerlon, 'argo')

    	return(
		    <Popup>
		      ID: {point[0]} <br />
		      Long / Lat: {helpers.mungePrecision(point[1])} / {helpers.mungePrecision(point[2])} <br />
		      Date: {point[3]} <br />
		      Data Sources: {point[4].join(', ')} <br />
		      <a target="_blank" rel="noreferrer" href={'/plots/argo?showAll=true&argoPlatform='+point[0].split('_')[0]+'&centerlon='+state.centerlon}>Platform Page</a><br />
		      <a target="_blank" rel="noreferrer" href={'/plots/argo?argoPlatform='+point[0].split('_')[0]+'&counterTraces=["'+point[0]+'"]&centerlon='+state.centerlon}>Profile Page</a>
		      {regionLink}
		    </Popup>
    	)
    }

    dateRangeMultiplyer(s){
    	// allowed date range will be multiplied by this much, as a function of the mutated state s
    	let m = 1
    	if(!s.argocore){
    		m = 5 // 5x date range when not asking for core.
    	}
    	return m
    }

    toggleCoupling(s){
    	// if changing a toggle for this page needs to trigger a side effect on state, do so here.

    	s.maxDayspan = helpers.calculateDayspan.bind(this)(s)

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
								<h5>Explore Argo Profiles</h5>
								<div className='verticalGroup'>
									<div className="form-floating mb-3">
										<input type="password" className="form-control" id="apiKey" value={this.state.apiKey} placeholder="" onInput={(v) => helpers.setToken.bind(this)('apiKey', v.target.value, null, true)}></input>
										<label htmlFor="apiKey">API Key</label>
										<div id="apiKeyHelpBlock" className="form-text">
						  					<a target="_blank" rel="noreferrer" href='https://argovis-keygen.colorado.edu/'>Get a free API key</a>
										</div>
									</div>

									<h6>Time range</h6>
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

									<h6>Depth</h6>
									<div className="form-floating mb-3">
										<input 
											id="depth"
											type="text"
											disabled={this.state.observingEntity} 
											className="form-control" 
											placeholder="0" 
											value={this.state.depthRequired} 
											onChange={e => {
												helpers.manageStatus.bind(this)('actionRequired', 'Hit return or click outside the current input to update.')
												this.setState({depthRequired:e.target.value})}
											} 
											onBlur={e => {this.setState({depthRequired:e.target.defaultValue, refreshData: true})}}
											onKeyPress={e => {if(e.key==='Enter'){this.setState({depthRequired:e.target.defaultValue, refreshData: true})}}}
											aria-label="depthRequired" 
											aria-describedby="basic-addon1"/>
										<label htmlFor="depth">Require levels deeper than [m]:</label>
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
								</div>

								<div className='verticalGroup'>
									<h6>Subsets</h6>
									<div className="form-check">
										<input className="form-check-input" checked={this.state.argocore} onChange={(v) => helpers.toggle.bind(this)(v, 'argocore')} type="checkbox" id='argocore'></input>
										<label className="form-check-label" htmlFor='argocore'>Display Argo Core <span style={{'color':this.chooseColor([null,null,null,null,['argo_core']]), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
									<div className="form-check">
										<input className="form-check-input" checked={this.state.argobgc} onChange={(v) => helpers.toggle.bind(this)(v, 'argobgc')} type="checkbox" id='argobgc'></input>
										<label className="form-check-label" htmlFor='argobgc'>Display Argo BGC <span style={{'color':this.chooseColor([null,null,null,null,['argo_bgc']]), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
									<div className="form-check">
										<input className="form-check-input" checked={this.state.argodeep} onChange={(v) => helpers.toggle.bind(this)(v, 'argodeep')} type="checkbox" id='argodeep'></input>
										<label className="form-check-label" htmlFor='argodeep'>Display Argo Deep <span style={{'color':this.chooseColor([null,null,null,null,['argo_deep']]), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
								</div>

								<div className='verticalGroup'>
									<h6>Object Filters</h6>
									<div className="form-floating mb-3">
			      						<Autosuggest
									      	id='argoPlatformAS'
									      	ref={this.platformRef}
									        suggestions={this.state.argoPlatformSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'argoPlatformSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'argoPlatformSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'argoPlatform')}
									        inputProps={{placeholder: 'Argo platform ID', value: this.state.argoPlatform, onChange: helpers.onAutosuggestChange.bind(this, 'Check value of Argo platform ID', 'argoPlatform', this.platformRef), id: 'argoPlatform'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
									</div>
									<a className="btn btn-primary" href="/argo" role="button">Reset Map</a>
								</div>

								<div className='verticalGroup'>
									<h6>Database stats</h6>
									<span>Number of core profiles: {this.state.nCore}</span><br/>
									<span>Number of BGC profiles: {this.state.nBGC}</span><br/>
									<span>Number of deep profiles: {this.state.nDeep}</span><br/>
									<span><i>Argo data is synced nightly from IFREMER</i></span>
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

export default ArgoExplore