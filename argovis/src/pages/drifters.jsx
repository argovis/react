import React from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Popup, CircleMarker} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import Autosuggest from 'react-autosuggest';
import '../index.css';
import helpers from'./helpers'
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

class DriftersExplore extends React.Component {

	constructor(props) {
		document.title = 'Argovis - Explore drifters'
		super(props);

		let q = new URLSearchParams(window.location.search) // parse out query string

		// limits for polygon / time coupling
		this.minDays = 0 // note the url construction always allows for one extra day than endDate-startDate
		this.maxDays = 365
		this.minArea = 100000
		this.maxArea = 1000000
		this.defaultDayspan = 0

		this.defaultPolygon = [[-62.57812500000001,52.482780222078226],[-84.37500000000001,34.016241889667036],[-87.18750000000001,15.623036831528264],[-64.33593750000001,13.923403897723347],[-40.42968750000001,46.07323062540835],[-62.57812500000001,52.482780222078226]]
		// default state, pulling in query string specifications
		this.state = {
			observingEntity: false,
			apiKey: localStorage.getItem('apiKey') ? localStorage.getItem('apiKey') : 'guest',
			wmoSuggestions: [],
			platformSuggestions: [],
			wmo: q.has('wmo') ? q.get('wmo') : '',
			platform: q.has('platform') ? q.get('platform') : '',
			points: [],
			polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : this.defaultPolygon,
			interpolated_polygon: q.has('polygon') ? helpers.insertPointsInPolygon(JSON.parse(q.get('polygon'))) : helpers.insertPointsInPolygon(this.defaultPolygon),
			urls: [],
			centerlon: q.has('centerlon') ? parseFloat(q.get('centerlon')) : -70,
			mapkey: Math.random(),
            phase: 'refreshData',
            data: [[]],
            suppressBlur: false,
		}
		this.state.maxDayspan = helpers.calculateDayspan.bind(this)(this.state)

		helpers.mungeTime.bind(this)(q, this.state.maxDayspan, '2020-01-01')

        // some other useful class variables
        this.fgRef = React.createRef()
        this.formRef = React.createRef()
        this.wmoRef = React.createRef()
        this.platformRef = React.createRef()
		this.statusReporting = React.createRef()
		this.reautofocus = null
        this.apiPrefix = 'https://argovis-drifters.colorado.edu/'
        this.vocab = {}
        this.lookupLabel = {}
        this.dataset = 'drifter'
        this.customQueryParams =  ['startDate', 'endDate', 'polygon', 'wmo', 'platform', 'centerlon']

        // get initial data
        this.state.urls = this.generateURLs(this.state)
        this.downloadData()

        // populate vocabularies, and trigger first render
        let vocabURLs = [this.apiPrefix + 'drifters/vocabulary?parameter=wmo', this.apiPrefix + 'drifters/vocabulary?parameter=platform']
		Promise.all(vocabURLs.map(x => fetch(x, {headers:{'x-argokey': this.state.apiKey}}))).then(responses => {
			Promise.all(responses.map(res => res.json())).then(data => {
				if(data[0].hasOwnProperty('code') && data[0].code === 401){
					helpers.manageStatus.bind(this)('error', 'Invalid API key; see the "Get a free API key" link below.')
				} else {
					this.vocab['wmo'] = data[0].map(x => String(x))
					this.vocab['platform'] = data[1]
				}
			})
		})
	}

    componentDidUpdate(prevProps, prevState, snapshot){
    	helpers.phaseManager.bind(this)(prevProps, prevState, snapshot)
    }

    downloadData(){
        Promise.all(this.state.urls.map(x => fetch(x, {headers:{'x-argokey': this.state.apiKey}}))).then(responses => {
            Promise.all(responses.map(res => res.json())).then(data => {
                for(let i=0; i<data.length; i++){
                    let bail = helpers.handleHTTPcodes.bind(this)(data[i].code)
                    if(bail){
                        return
                    }
                }

                this.setState({
                    phase: 'remapData',
                    data: data
                })

            })
        })
    }

    replot(){
        let points = []

        if(!(JSON.stringify(this.state.data) === '[[]]' || JSON.stringify(this.state.data) === '[]' || this.state.data.hasOwnProperty('code') || this.state.data[0].hasOwnProperty('code'))){
            for(let i=0; i<this.state.data.length; i++){
                let newpoints = this.state.data[i].map(point => {return(
                    <CircleMarker key={point[0]+Math.random()} center={[point[2], helpers.mutateLongitude(point[1], parseFloat(this.state.centerlon)) ]} radius={2} color={this.chooseColor(point)}>
                        {this.genTooltip.bind(this)(point)}
                    </CircleMarker>
                  )})
                points = points.concat(newpoints)
            }
        }

        this.setState({ 
            points: points, 
            phase: 'idle',
            suppressBlur: false,
        })
    }

    generateURLs(params){
        let wmo = params.hasOwnProperty('wmo') ? params.wmo : this.state.wmo
        let platform = params.hasOwnProperty('platform') ? params.platform : this.state.platform
        let startDate = params.hasOwnProperty('startDate') ? params.startDate : this.state.startDate
        let endDate = params.hasOwnProperty('endDate') ? params.endDate : this.state.endDate
        let polygon = params.hasOwnProperty('polygon') ? params.polygon : this.state.polygon
        let depthRequired = params.hasOwnProperty('depthRequired') ? params.depthRequired : this.state.depthRequired

    	if(wmo !== ''){
    		return [this.apiPrefix +'drifters?compression=minimal&wmo=' + wmo]
    	} else if (platform !== ''){
    		return [this.apiPrefix +'drifters?compression=minimal&platform=' + platform]
    	} else {
    		return [helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'drifters', startDate, endDate, polygon, depthRequired)]	
    	}
    }

    lookingForEntity(state){
    	// return true if any token, valid or not, is specified for any entity query string parameter
    	return Boolean(state.wmo || state.platform)
    }

    chooseColor(point){
    	return 'black'
    }

    genTooltip(point){
    	// given an array <point> corresponding to a single point returned by an API data route with compression=minimal,
    	// return the jsx for an appropriate tooltip for this point.

    	let regionLink = helpers.genRegionLink(this.state.polygon, this.state.startDate, this.state.endDate, this.state.centerlon, 'drifters')

    	return(
		    <Popup>
		      ID: {point[0]} <br />
		      Long / Lat: {helpers.mungePrecision(point[1])} / {helpers.mungePrecision(point[2])} <br />
		      Date: {point[3]} <br />
		      <a target="_blank" rel="noreferrer" href={'/plots/drifters?showAll=true&wmo='+point[4]+'&centerlon='+this.state.centerlon}>{'WMO ' + point[4] + ' page'}</a><br />
		      <a target="_blank" rel="noreferrer" href={'/plots/drifters?showAll=true&platform='+point[0].split('_')[0]+'&centerlon='+this.state.centerlon}>{'Drifter platform ' + point[0].split('_')[0] + ' Page'}</a>
		      {regionLink}
		    </Popup>
    	)
    }

    dateRangeMultiplyer(s){
    	// allowed date range will be multiplied by this much, as a function of the mutated state s
    	return 1
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
								<h5>
									<OverlayTrigger
										placement="right"
										overlay={
											<Tooltip id="compression-tooltip" className="wide-tooltip">
												The Global Drifter Program deploys floating surface probes across the ocean to collect hourly in-situ estimates of surface parameters. Narrow down your search using the form below, or specify a geographic region by first clicking on the pentagon button in the top left of the map, then choosing the vertexes of your region of interest. Click on points that appear to see links to more information.
											</Tooltip>
										}
										trigger="click"
									>
										<i style={{'float':'right'}} className="fa fa-question-circle" aria-hidden="true"></i>
                                    </OverlayTrigger>
									Explore Global Drifter Program	
								</h5>
								<div className='verticalGroup'>
									<div className="form-floating mb-3">
										<input 
                                            type="password" 
                                            className="form-control" 
                                            id="apiKey" 
                                            value={this.state.apiKey} 
                                            placeholder="" 
                                            onInput={helpers.changeAPIkey.bind(this)}
                                        ></input>
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
                                            onChange={e => {this.setState({startDate:e.target.value, phase: 'awaitingUserInput'})}} 
                                            onBlur={e => {
                                                if(!this.state.suppressBlur){
                                                    helpers.changeDates.bind(this)('startDate', e)
                                                }
                                            }}
                                            onKeyPress={e => {
                                                if(e.key==='Enter'){
                                                    helpers.changeDates.bind(this)('startDate', e)
                                                }
                                            }}
										/>
										<label htmlFor="startDate">Start Date</label>
									</div>
									<div className="form-floating mb-3">
										<input 
											type="date" 
											disabled={this.state.observingEntity} 
											className="form-control" 
											id="endDate" 
											value={this.state.endDate} 
											placeholder="" 
                                            onChange={e => {this.setState({endDate:e.target.value, phase: 'awaitingUserInput'})}} 
                                            onBlur={e => {
                                                if(!this.state.suppressBlur){
                                                    helpers.changeDates.bind(this)('endDate', e)
                                                }
                                            }}
                                            onKeyPress={e => {
                                                if(e.key==='Enter')
                                                    {helpers.changeDates.bind(this)('endDate', e)
                                                }
                                            }}
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
                                        onChange={e => {this.setState({centerlon:e.target.value, phase: 'awaitingUserInput'})}} 
                                        onBlur={e => {
                                            this.setState({
                                                centerlon: helpers.manageCenterlon(e.target.value), 
                                                mapkey: Math.random(), 
                                                phase: 'remapData'
                                            })
                                        }}
                                        onKeyPress={e => {
                                            if(e.key==='Enter'){
                                                this.setState({
                                                    centerlon: helpers.manageCenterlon(e.target.value), 
                                                    mapkey: Math.random(), 
                                                    phase: 'remapData',
                                                    suppressBlur: true
                                                })
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
									      	id='wmoAS'
									      	ref={this.wmoRef}
									        suggestions={this.state.wmoSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'wmoSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'wmoSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'wmo')}
									        inputProps={{
                                                placeholder: 'WMO ID', 
                                                value: this.state.wmo, 
                                                onKeyPress: helpers.changeAutoSuggest.bind(this, 'wmo', this.vocab.wmo, this.state),  
                                                onBlur: helpers.changeAutoSuggest.bind(this, 'wmo', this.vocab.wmo, this.state), 
                                                onChange: helpers.inputAutoSuggest.bind(this, 'wmo', this.vocab.wmo, this.wmoRef),
                                                id: 'wmo', 
                                                disabled: Boolean(this.state.platform)
                                            }}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
									</div>

									<div className="form-floating mb-3">
			      						<Autosuggest
									      	id='platformAS'
									      	ref={this.platformRef}
									        suggestions={this.state.platformSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'platformSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'platformSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'platform')}
									        inputProps={{
                                                placeholder: 'Platform ID', 
                                                value: this.state.platform, 
                                                onKeyPress: helpers.changeAutoSuggest.bind(this, 'platform', this.vocab.platform, this.state),  
                                                onBlur: helpers.changeAutoSuggest.bind(this, 'platform', this.vocab.platform, this.state), 
                                                onChange: helpers.inputAutoSuggest.bind(this, 'platform', this.vocab.platform, this.platformRef), 
                                                id: 'platform',  
                                                disabled: Boolean(this.state.wmo)
                                            }}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
									</div>
									<a className="btn btn-primary" href="/drifters" role="button">Reset Map</a>
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
								onDeleted={p => helpers.onPolyDelete.bind(this)(this.defaultPolygon,p)}
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
								{this.state.wmo === '' && this.state.platform === '' && <Polygon key={Math.random()} positions={this.state.interpolated_polygon.map(x => [x[1],helpers.mutateLongitude(x[0], this.state.centerlon)])} fillOpacity={0}></Polygon>}
							</FeatureGroup>
							{this.state.points}
						</MapContainer>
					</div>
				</div>
			</>
		)
	}
}

export default DriftersExplore