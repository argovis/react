import React from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Popup, CircleMarker} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import Autosuggest from 'react-autosuggest';
import '../index.css';
import helpers from'./helpers'
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

class ShipsExplore extends React.Component {

	constructor(props) {
		document.title = 'Argovis - Explore ship-based profiles'
		super(props);

		let q = new URLSearchParams(window.location.search) // parse out query string

		// limits for polygon / time coupling
		this.minDays = 31
		this.maxDays = 365
		this.minArea = 1000000
		this.maxArea = 10000000
		this.defaultDayspan = 31

		// default state, pulling in query string specifications
		this.state = {
			observingEntity: false,
			apiKey: localStorage.getItem('apiKey') ? localStorage.getItem('apiKey') : 'guest',
			woce: q.has('woce') ? q.get('woce') === 'true' : false,
			goship: q.has('goship') ? q.get('goship') === 'true' : false,
			other: q.has('other') ? q.get('other') === 'true' : false,
			wocelineSuggestions: [],
			woceline: q.has('woceline') ? q.get('woceline') : '',
			cruiseSuggestions: [],
			cruise: q.has('cruise') ? q.get('cruise') : '',
			points: [],
			polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : [],
			interpolated_polygon: q.has('polygon') ? helpers.insertPointsInPolygon(JSON.parse(q.get('polygon'))) : [],
			urls: [],
			depthRequired: q.has('depthRequired') ? parseFloat(q.get('depthRequired')) : 0,
			centerlon: q.has('centerlon') ? parseFloat(q.get('centerlon')) : -160,
			mapkey: Math.random(),
            phase: 'refreshData',
            data: [[]],
            suppressBlur: false,

		}
		this.state.maxDayspan = helpers.calculateDayspan.bind(this)(this.state)

		helpers.mungeTime.bind(this)(q, this.state.maxDayspan, '1993-07-31')

        // if no query string specified at all or no categories selected turn on all cchdo categories
        if(!window.location.search || (!q.has('woce') && !q.has('goship') && !q.has('other')) ){
        	console.log('imposing defaults')
        	this.state.woce = true
        	this.state.goship = true
        	this.state.other = true
        }

        // some other useful class variables
        this.fgRef = React.createRef()
        this.formRef = React.createRef()
        this.woceRef = React.createRef()
        this.cruiseRef = React.createRef()
		this.statusReporting = React.createRef()
		this.reautofocus = null
        this.apiPrefix = 'https://argovis-api.colorado.edu/'
        this.vocab = {}
        this.wocelineLookup = {}
        this.wocegroupLookup = {}
        this.dataset = 'cchdo'
        this.customQueryParams = ['startDate', 'endDate', 'polygon', 'depthRequired', 'woce', 'goship', 'other', 'woceline', 'cruise', 'centerlon']

        // get initial data
        this.state.urls = this.generateURLs(this.state)
        this.downloadData()

        // populate vocabularies, and trigger first render
        let vocabURLs = [this.apiPrefix + 'summary?id=cchdo_occupancies', this.apiPrefix + 'cchdo/vocabulary?parameter=cchdo_cruise']
		Promise.all(vocabURLs.map(x => fetch(x, {headers:{'x-argokey': this.state.apiKey}}))).then(responses => {
			Promise.all(responses.map(res => res.json())).then(data => {
				if(data[0].hasOwnProperty('code') && data[0].code === 401){
					helpers.manageStatus.bind(this)('error', 'Invalid API key; see the "Get a free API key" link below.')
				} else {
					this.vocab['woceline'] = Object.keys(data[0][0].summary).map(key => {
						this.wocegroupLookup[key] = {}
						return data[0][0].summary[key].map((x,i) => {
							let label = key + ' - ' + String(x.startDate.slice(0,7) )
							this.wocelineLookup[label] = data[0][0].summary[key][i]			// for lookups by <woceline - start yyyy-mm>
							this.wocegroupLookup[key][label] = [new Date(data[0][0].summary[key][i].startDate), new Date(data[0][0].summary[key][i].endDate)]   // for lookups by woceline
							return label
						}) 
					})
					this.vocab['woceline'] = [].concat(...this.vocab['woceline'])
					this.vocab['cruise'] = data[1].map(x=>String(x))
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

    generateURLs(params) {
        let woceline = params.hasOwnProperty('woceline') ? params.woceline : this.state.woceline
        let cruise = params.hasOwnProperty('cruise') ? params.cruise : this.state.cruise
        let startDate = params.hasOwnProperty('startDate') ? params.startDate : this.state.startDate
        let endDate = params.hasOwnProperty('endDate') ? params.endDate : this.state.endDate
        let polygon = params.hasOwnProperty('polygon') ? params.polygon : this.state.polygon
        let depthRequired = params.hasOwnProperty('depthRequired') ? params.depthRequired : this.state.depthRequired
        let woce = params.hasOwnProperty('woce') ? params.woce : this.state.woce
        let goship = params.hasOwnProperty('goship') ? params.goship : this.state.goship
        let other = params.hasOwnProperty('other') ? params.other : this.state.other

        if(woceline !== ''){
    		// parse out what WOCE line and date range is meant by the autocomplete, and give an extra hour on either end
    		if(this.wocelineLookup.hasOwnProperty(woceline)){
                let wl = woceline.split(' ')[0]
                let sd = new Date(this.wocelineLookup[woceline].startDate)
                let ed = new Date(this.wocelineLookup[woceline].endDate)
                sd.setHours(sd.getHours() - 1)
                ed.setHours(ed.getHours() + 1)
                return [this.apiPrefix +'cchdo?compression=minimal&woceline=' + wl + '&startDate=' + sd.toISOString().replace('.000Z', 'Z') + '&endDate=' + ed.toISOString().replace('.000Z', 'Z')]
            } else{
                return []
            }
    	} else if(cruise !== '') {
    		return [this.apiPrefix +'cchdo?compression=minimal&cchdo_cruise=' + cruise]
    	} else {

	    	let url = helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'cchdo', startDate, endDate, polygon, depthRequired)	

	    	// decide on source.source
	    	let source = []
	    	if(!other && !woce && !goship){
	    		return []
	    	}else if(other && woce && goship){
	    		source = []
	    	} else if(other && woce && !goship){
	    		source = ['~cchdo_woce,~cchdo_go-ship', 'cchdo_woce']
	    	} else if(other && !woce && goship){
	    		source = ['~cchdo_woce,~cchdo_go-ship', 'cchdo_go-ship']
	    	} else if(!other && woce && goship){
	    		source = ['cchdo_go-ship', 'cchdo_woce']
	    	} else if(other && !woce && !goship){
	    		source = ['~cchdo_go-ship,~cchdo_woce']
	    	} else if(!other && woce && !goship){
	    		source = ['cchdo_woce']
	    	} else if(!other && !woce && goship){
	    		source = ['cchdo_go-ship']
	    	}

	    	if(source.length === 0){
	    		return [url]
	    	} else{
	    		return source.map(x => url+'&source='+x)
	    	}
	    }
    }

    toggleCCHDOProgram(program){
    	let s = {...this.state}
        
        s[program] = !s[program]
        s.urls = this.generateURLs(s)
        s.phase = 'refreshData'

        this.setState(s)
    }  

    lookingForEntity(state){
    	// return true if any token, valid or not, is specified for any entity query string parameter
    	return Boolean(state.woceline || state.cruise)
    }

    chooseColor(point){
    	if(point[4].includes('cchdo_woce')){
    		return 'orange'
    	} else if(point[4].includes('cchdo_go-ship')){
    		return 'magenta'
    	} else{
	    	return '#999999'
	    }
    }

    genTooltip(point){
    	// given an array <point> corresponding to a single point returned by an API data route with compression=minimal,
    	// return the jsx for an appropriate tooltip for this point.

    	// determine the woceline occupancies for this point, if any; give an extra hour on either end to capture edges. 
    	let woceoccupy = point[5].map(x => {
    		let timespan = helpers.determineWoceGroup(x, new Date(point[3]), this.wocegroupLookup)
    		timespan[0].setHours(timespan[0].getHours() - 1)
    		timespan[1].setHours(timespan[1].getHours() + 1)
    		return [x].concat(timespan)
    	})

      	let regionLink = helpers.genRegionLink(this.state.polygon, this.state.startDate, this.state.endDate, this.state.centerlon, 'ships')

    	return(
		    <Popup>
		      ID: {point[0]} <br />
		      Long / Lat: {helpers.mungePrecision(point[1])} / {helpers.mungePrecision(point[2])} <br />
		      Date: {point[3]} <br />
		      Data Sources: {point[4]} <br />
		      {woceoccupy.map(x => {
		      	return(<span key={Math.random()}><a target="_blank" rel="noreferrer" href={'/plots/ships?showAll=true&woceline='+x[0]+'&startDate=' + x[1].toISOString().replace('.000Z', 'Z') + '&endDate=' + x[2].toISOString().replace('.000Z', 'Z')+'&centerlon='+this.state.centerlon}>{'Plots for ' + x[3]}</a><br /></span>)
		      })}
		      <a target="_blank" rel="noreferrer" href={'/plots/ships?showAll=true&cruise='+point[6]+'&centerlon='+this.state.centerlon}>{'Plots for cruise ' + point[6]}</a><br />
		      <a target="_blank" rel="noreferrer" href={'/plots/ships?cruise='+point[6]+'&centerlon='+this.state.centerlon+'&counterTraces=["'+point[0]+'"]'}>Profile Page</a>
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
												Ship based profiles are CTD and bottle-based oceanic profiles collected by ships. Narrow down your search using the form below, or specify a geographic region by first clicking on the pentagon button in the top left of the map, then choosing the vertexes of your region of interest. Click on points that appear to see links to more information.
											</Tooltip>
										}
										trigger="click"
									>
										<i style={{'float':'right'}} className="fa fa-question-circle" aria-hidden="true"></i>
                                    </OverlayTrigger>
									Explore Ship-Based Profiles
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

                                    <h6>Depth</h6>
									<div className="form-floating mb-3">
										<input 
											id="depth"
											type="text"
											disabled={this.state.observingEntity} 
											className="form-control" 
											placeholder="0" 
											value={this.state.depthRequired} 
                                            onChange={e => {this.setState({depthRequired:e.target.value, phase: 'awaitingUserInput'})}} 
											onBlur={e => {
                                                if(!this.state.suppressBlur){
                                                    helpers.changeDepth.bind(this)(e)
                                                }
                                            }}
                                            onKeyPress={e => {
                                                if(e.key==='Enter')
                                                    {helpers.changeDepth.bind(this)(e)
                                                }
                                            }}
											aria-label="depthRequired" 
											aria-describedby="basic-addon1"/>
										<label htmlFor="depth">Require levels deeper than [m]:</label>
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
									<h6>Subsets</h6>
									<div className="form-check">
										<input className="form-check-input" disabled={this.state.observingEntity} checked={this.state.woce} onChange={(v) => this.toggleCCHDOProgram.bind(this)('woce')} type="checkbox" id='woce'></input>
										<label className="form-check-label" htmlFor='woce'>Display WOCE <span style={{'color':this.chooseColor([null,null,null,null,['cchdo_woce']]), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
									<div className="form-check">
										<input className="form-check-input" disabled={this.state.observingEntity} checked={this.state.goship} onChange={(v) => this.toggleCCHDOProgram.bind(this)('goship')} type="checkbox" id='goship'></input>
										<label className="form-check-label" htmlFor='goship'>Display GO-SHIP <span style={{'color':this.chooseColor([null,null,null,null,['cchdo_go-ship']]), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
									<div className="form-check">
										<input className="form-check-input" disabled={this.state.observingEntity} checked={this.state.other} onChange={(v) => this.toggleCCHDOProgram.bind(this)('other')} type="checkbox" id='other'></input>
										<label className="form-check-label" htmlFor='other'>Display other ships <span style={{'color':this.chooseColor([null,null,null,null,['cchdo_x']]), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
								</div>

								<div className='verticalGroup'>
									<h6>Object Filters</h6>
									<div className="form-floating mb-3">
			      						<Autosuggest
									      	id='woceAS'
									      	ref={this.woceRef}
									        suggestions={this.state.wocelineSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'wocelineSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'wocelineSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'woceline')}
									        inputProps={{
                                                placeholder: 'WOCE Line', 
                                                value: this.state.woceline, 
                                                onKeyPress: helpers.changeAutoSuggest.bind(this, 'woceline', this.vocab.woceline, this.state),  
                                                onBlur: helpers.changeAutoSuggest.bind(this, 'woceline', this.vocab.woceline, this.state), 
                                                onChange: helpers.inputAutoSuggest.bind(this, 'woceline', this.vocab.woceline, this.woceRef), 
                                                id: 'woceline', 
                                                disabled: Boolean(this.state.cruise)
                                            }}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
									</div>

									<div className="form-floating mb-3">
			      						<Autosuggest
									      	id='cruiseAS'
									      	ref={this.cruiseRef}
									        suggestions={this.state.cruiseSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'cruiseSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'cruiseSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'cruise')}
									        inputProps={{
                                                placeholder: 'Cruise ID', 
                                                value: this.state.cruise, 
                                                onKeyPress: helpers.changeAutoSuggest.bind(this, 'cruise', this.vocab.cruise, this.state),  
                                                onBlur: helpers.changeAutoSuggest.bind(this, 'cruise', this.vocab.cruise, this.state), 
                                                onChange: helpers.inputAutoSuggest.bind(this, 'cruise', this.vocab.cruise, this.cruiseRef),
                                                id: 'cruise', 
                                                disabled: Boolean(this.state.woceline)
                                            }}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
									</div>

									<a className="btn btn-primary" href="/ships" role="button">Reset Map</a>
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

export default ShipsExplore