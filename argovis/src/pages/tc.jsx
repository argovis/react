import React from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Popup} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import Autosuggest from 'react-autosuggest';
import '../index.css';
import helpers from'./helpers'

class TCExplore extends React.Component {

	constructor(props) {
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
			apiKey: 'guest',
			tcNameSuggestions: [],
			tcName: q.has('tcName') ? q.get('tcName') : '',
			refreshData: false,
			points: [],
			polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : [],
			urls: [],
			maxDayspan: 30
		}

		helpers.mungeTime.bind(this)(q, this.state.maxDayspan+1, '2020-08-31') // +1 since we include the end date here.

        // some other useful class variables
        this.fgRef = React.createRef()
        this.formRef = React.createRef()
		this.statusReporting = React.createRef()
        //this.apiPrefix = 'https://argovis-api.colorado.edu/'
        this.apiPrefix = 'http://3.88.185.52:8080/'
        this.vocab = {}
        this.lookupLabel = {}
        this.dataset = 'tc'
        this.customQueryParams =  ['startDate', 'endDate', 'polygon', 'tcName']

        // populate vocabularies, and trigger first render
        fetch(this.apiPrefix + 'summary?id=tc_labels', {headers:{'x-argokey': this.state.apiKey}})
        .then(response => response.json())
        .then(data => {
        	this.vocab['tcName'] = data[0].summary.map(x=>x.label)
        	this.lookupLabel = {}
        	for(let i=0; i<data[0].summary.length; i++){
        		this.lookupLabel[data[0].summary[i].label] = data[0].summary[i]._id
        	}
        	this.setState({refreshData:true})
        })
	}

    componentDidUpdate(prevProps, prevState, snapshot){
    	helpers.componentDidUpdate.bind(this)()
    }

    lookingForEntity(){
    	// return true if any token, valid or not, is specified for any entity query string parameter
    	return Boolean(this.state.tcName)
    }

    generateURLs(){
    	if(this.state.tcName !== ''){
    		return [this.apiPrefix +'tc?compression=minimal&metadata=' + this.lookupLabel[this.state.tcName]]
    	} else {
    		return [helpers.generateTemporoSpatialURL.bind(this)('tc')]
    	}
    }	

    chooseColor(point){
    	return 'red'
    }

    genTooltip(point){
    	// given an array <point> corresponding to a single point returned by an API data route with compression=minimal,
    	// return the jsx for an appropriate tooltip for this point.
    	console.log(this.lookupLabel)
    	return(
		    <Popup>
		      ID: {point[0]} <br />
		      Long / Lat: {point[1]} / {point[2]} <br />
		      Date: {point[3]} <br />
		      <a target="_blank" rel="noreferrer" href={'/plots/tc?showAll=true&tcMeta='+point[0].split('_')[0]}>Cyclone Page</a>
		    </Popup>
    	)
    }

	render(){
		console.log(this.state)
		return(
			<>
				<div className='row' style={{'width':'100vw'}}>
					<div className='col-3 overflow-auto'>
						<fieldset ref={this.formRef}>
							<span id='statusBanner' ref={this.statusReporting} className='statusBanner busy'>Downloading...</span>
							<div className='mapSearchInputs'>
								<h5>Explore Tropical Cyclones</h5>
								<div className='verticalGroup'>
									<div className="form-floating mb-3">
										<input type="password" className="form-control" id="apiKey" placeholder="" onInput={(v) => helpers.setToken.bind(this)('apiKey', v.target.value)}></input>
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

								<div className='verticalGroup'>
									<h6>Object Filters</h6>
									<div className="form-floating mb-3">
			      						<Autosuggest
									      	id='tcNameAS'
									        suggestions={this.state.tcNameSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'tcNameSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'tcNameSuggestions')}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'tcName')}
									        inputProps={{placeholder: 'TC Name', value: this.state.tcName, onChange: helpers.onAutosuggestChange.bind(this, 'Check value of TC Name', 'tcName'), id: 'tcName'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item autocomplete-item'}}
			      						/>
									</div>
									<div id="coloHelpBlock" className="form-text">
					  					<a target="_blank" rel="noreferrer" href='https://github.com/argovis/demo_notebooks/blob/main/Tropical_Cyclone_Colocation.ipynb'>Colocate cyclones with other products</a>
									</div>
								</div>
							</div>
						</fieldset>
					</div>

					{/*leaflet map*/}
					<div className='col-9'>
						<MapContainer center={[25, 0]} zoom={2} scrollWheelZoom={true}>
							<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<FeatureGroup ref={this.fgRef}>
								<EditControl
								position='topleft'
								onEdited={p => helpers.onPolyEdit.bind(this,p)()}
								onCreated={p => helpers.onPolyCreate.bind(this,p)()}
								onDeleted={p => helpers.onPolyDelete.bind(this,p)()}
								onDrawStop={p => helpers.onDrawStop.bind(this,p)()}
								onDrawStart={p => helpers.onDrawStart.bind(this,p)()}
								draw={{
									rectangle: false,
									circle: false,
									polyline: false,
									circlemarker: false,
									marker: false,
									polygon: {
										shapeOptions: {
											fillOpacity: 0
										}
									}
								}}
								/>
								<Polygon key={JSON.stringify(this.state.polygon)} positions={this.state.polygon.map(x => [x[1],x[0]])} fillOpacity={0}></Polygon>
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