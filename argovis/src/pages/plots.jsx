import React from 'react';
import { MapContainer, TileLayer, CircleMarker} from 'react-leaflet'
import Autosuggest from 'react-autosuggest';
import '../index.css';
import helpers from'./helpers'
import Plot from 'react-plotly.js';

class AVPlots extends React.Component {

	constructor(props) {
		super(props);

		let q = new URLSearchParams(window.location.search) // parse out query string

		// default state, pulling in query string specifications
		this.state = {
			apiKey: 'guest',
			xKey: q.has('xKey') ? q.get('xKey') : '',
			yKey: q.has('yKey') ? q.get('yKey') : '',
			zKey: q.has('zKey') ? q.get('zKey') : '',
			cKey: q.has('cKey') ? q.get('cKey') : '',
			xKeySuggestions: [],
			yKeySuggestions: [],
			zKeySuggestions: [],
			cKeySuggestions: [],
			cscaleSuggestions: [],
			xmin: q.has('xmin') ? q.get('xmin') : '',
			xmax: q.has('xmax') ? q.get('xmax') : '',
			ymin: q.has('ymin') ? q.get('ymin') : '',
			ymax: q.has('ymax') ? q.get('ymax') : '',
			zmin: q.has('zmin') ? q.get('zmin') : '',
			zmax: q.has('zmax') ? q.get('zmax') : '',
			cmin: q.has('cmin') ? q.get('cmin') : '',
			cmax: q.has('cmax') ? q.get('cmax') : '',
			cscale:  q.has('cscale') ? q.get('cscale') : 'Viridis',
			reverseX: q.has('reverseX') ? q.get('reverseX') === 'true' : false,
			reverseY: q.has('reverseY') ? q.get('reverseY') === 'true' : false,
			reverseZ: q.has('reverseZ') ? q.get('reverseZ') === 'true' : false,
			reverseC: q.has('reverseC') ? q.get('reverseC') === 'true' : false,
			title: '',
			data: [{}],
			metadata: {},
			showAll:  q.has('showAll') ? q.get('showAll') === 'true' : false,
			counterTraces: q.has('counterTraces') ? q.get('counterTraces') : [], // trace IDs with a show status opposite to showAll
			argoPlatform: q.has('argoPlatform') ? q.get('argoPlatform') : '',
			points: [],
			connectingLines: q.has('connectingLines') ? q.get('connectingLines') === 'true' : false,
			refreshData: true
		}

		this.apiPrefix = 'http://3.88.185.52:8080/'
		this.vocab = {xKey: [], yKey: [], zKey: [], cKey: [], cscale: ['Blackbody','Bluered','Blues','Cividis','Earth','Electric','Greens','Greys','Hot','Jet','Picnic','Portland','Rainbow','RdBu','Reds','Viridis','YlGnBu','YlOrRd']}
		this.statusReporting = React.createRef()
		this.showAll = true // show all autoselect options when field is focused and empty
		this.units = {
			'longitude': 'deg',
			'latitude': 'deg',
			'temperature': 'C'
		}
		this.header = []
		this.rows = []
		this.customQueryParams = [
			'argoPlatform', 
			'xKey', 'xmin', 'xmax', 'reverseX', 
			'yKey', 'ymin', 'ymax', 'reverseY',
			'zKey', 'zmin', 'zmax', 'reverseZ',
			'cKey', 'cmin', 'cmax', 'reverseC',
			'cscale', 'connectingLines', 
			'showAll', 'counterTraces'
		]

		let x = Promise.all(this.generateURLs().map(x => fetch(x, {headers:{'x-argokey': this.state.apiKey}}))).then(responses => {
			Promise.all(responses.map(res => res.json())).then(data => {
				// keep raw json blob for download
				this.json = new Blob([JSON.stringify(data)], {type: 'text/json'})
				this.json = window.URL.createObjectURL(this.json)

				let p = [].concat(...data)

				// get a list of metadata we'll need
				let metakeys = Array.from(new Set(p.map(x=>x['metadata'])))

				// set up vocab lists
				let vars = ['month', 'year'].concat(this.getDataKeys(p))

				// transpose data for traces
				p = p.map(d => this.transpose.bind(this)(d))
				let mappoints = p.map(point => {
					return(
						<CircleMarker key={point._id+Math.random()} center={[point.latitude[0], point.longitude[0]]} radius={1} color={'yellow'}/>
					)
				})

	        	this.vocab['xKey'] = vars
	        	this.vocab['yKey'] = vars
	        	this.vocab['zKey'] = ['[2D plot]'].concat(vars)
	        	this.vocab['cKey'] = vars

	        	let m = Promise.all(this.generateMetadataURLs(metakeys).map(x => fetch(x, {headers:{'x-argokey': this.state.apiKey}}))).then(responses => {
					Promise.all(responses.map(mres => mres.json())).then(metadata => {
						metadata = [].concat(...metadata)
						let meta = {}

						// metadata lookup table
						for(let i=0; i<metadata.length; i++){
							meta[metadata[i]._id] = metadata[i]
						}

						// prep csv data, and transforms to go from csv -> html table
						let profiles = [].concat(...data)
						this.header = ['ID', 'Longitude', 'Latitude', 'Timestamp', 'DAC', 'Original Files']
						this.rows = profiles.map(d => {
							return [
								d._id, // keep data record id first element in each array
								d.geolocation.coordinates[0],
								d.geolocation.coordinates[1],
								d.timestamp,
								meta[d.metadata].data_center,
								d.source.map(s => s.url)
							]
						})
						this.transforms = [
							id=>id,
							lon=>lon,
							lat=>lat,
							timestamp=>timestamp,
							datacenter=>datacenter,
							urls => urls.map(u=>{
										if(u.includes('profiles/S')){
											return(<a key={Math.random()} className="btn btn-success" style={{'marginRight':'0.5em'}} href={u} role="button">BGC</a>)
										} else {
											return(<a key={Math.random()} className="btn btn-primary" href={u} role="button">Core</a>)
										}
									})
						]
						// break source links out into their own columns for the csv
						let rows = this.rows.map(r => {
							let row = r.slice(0,-1)
							let urls = r[5]
							let core = urls.filter(u => !u.includes('profiles/S'))[0]
							let synth = urls.filter(u => u.includes('profiles/S'))
							if(synth.length > 0){
								synth = synth[0]
							} else {
								synth = ''
							}
							return row.concat(core).concat(synth)
						})
						this.csv = this.header.slice(0,-1).concat('Original core file').concat('Original synthetic file').join(',') + '\n'
						this.csv += rows.map(r => JSON.stringify(r).replaceAll('\"', '').replaceAll('[', '').replaceAll(']', '')).join('\n')
						this.csv = new Blob([this.csv], {type: 'text/csv'})
						this.csv = window.URL.createObjectURL(this.csv)

			        	this.setState({
			        		data:p, 
			        		variables: vars, 
			        		metadata: meta,
			        		points: mappoints,
			        		xKey: this.state.xKey ? this.state.xKey : 'temperature',
			        		yKey: this.state.yKey ? this.state.yKey : 'salinity',
			        		zKey: this.state.zKey ? this.state.zKey : '[2D plot]',
			        		cKey: this.state.cKey ? this.state.cKey : 'latitude'
			        	})
					})
				})
			})
		})
	}

    componentDidUpdate(prevProps, prevState, snapshot){
    	this.state.refreshData = false
    	if(prevState.refreshData){
	    	helpers.manageStatus.bind(this)('ready')
	    }
	    helpers.setQueryString.bind(this)()
    }

	transpose(profile){
		// given a <profile> object returned with data from the API and compression=all,
		// transpose the data record into an object keyed by data_key, and values as depth-ordered list of measurements
		let t = {}
		for(let i=0; i<profile.data_keys.length; i++){
			t[profile.data_keys[i]] = profile.data.map(x => x[i])
			if(!this.units.hasOwnProperty(profile.data_keys[i])){
				this.units[profile.data_keys[i]] = profile.units[i]
			}
		}
		t['longitude'] = Array(profile.data.length).fill(profile.geolocation.coordinates[0],0)
		t['latitude'] = Array(profile.data.length).fill(profile.geolocation.coordinates[1],0)
		let msse = new Date(profile.timestamp) // handle times internally as ms since epoch
		t['timestamp'] = Array(profile.data.length).fill(msse.getTime(),0)
		t['month'] = Array(profile.data.length).fill((msse.getMonth()+1),0)
		t['year'] = Array(profile.data.length).fill(msse.getFullYear(),0)
		t['_id'] = profile._id
		t['metadata'] = profile.metadata
		t['source'] = profile.source

		return t
	}

	getDataKeys(data){
		// given an array of profile objects <data>. return a global list of keys, plus coordinates

		let keys = ['longitude', 'latitude', 'timestamp']
		for(let i=0; i<data.length; i++){
			keys = keys.concat(data[i].data_keys)
		}
		let s = new Set(keys)
		return Array.from(s)
	}

	generateURLs(){
		// return an array of API URLs to be fetched based on current state variables.

		let urls = []

		if(this.state.argoPlatform){
			urls = urls.concat(this.apiPrefix + 'argo/?compression=array&data=all&platform=' + this.state.argoPlatform)
		}

		return urls
	}

	generateMetadataURLs(metakeys){
		return metakeys.map(x => this.apiPrefix + 'argo/meta?id=' + x)
	}

	generateRange(min, max, dataKey, reverse){
		// returns an array [minimum, maximum] as defined by <min> and <max>,
		// unless min and or max is null, in which case an appropriate limit is computed from <dataKey>

		// turn a human string time into something sensible 
		if(dataKey === 'timestamp'){
			if(min !== ''){
				min = new Date(min)
				min = min.getTime()
			}
			if(max !== ''){
				max = new Date(max)
				max = max.getTime()
			}
		}

		if(min !== '' && max !== ''){
			if(reverse){
				return [Number(max), Number(min)]
			} else {
				return [Number(min), Number(max)]
			}
		}

		let range = []
		let data = this.state.data.map(x=>x[dataKey])
		let dataMin = Math.min(...([].concat(...data)).filter(x=>typeof x === 'number') )
		let dataMax = Math.max(...([].concat(...data)).filter(x=>typeof x === 'number') )
		let buffer = (dataMax - dataMin)*0.05
		range[0] = min === '' ? dataMin - buffer : Number(min)
		range[1] = max === '' ? dataMax + buffer : Number(max)

		if(reverse){
			return [range[1], range[0]]
		} else {
			return range
		}
	}

	zoomSync(event){
		// when plotly generates an <event> from click-and-drag zoom,
		// make sure the manual inputs keep up
		if(JSON.stringify(Object.keys(event).sort()) === '["xaxis.range[0]","xaxis.range[1]","yaxis.range[0]","yaxis.range[1]"]'){
			this.setState({
				xmin: event["xaxis.range[0]"] ? event["xaxis.range[0]"]: '',
				xmax: event["xaxis.range[1]"] ? event["xaxis.range[1]"]: '',
				ymin: event["yaxis.range[0]"] ? event["yaxis.range[0]"]: '',
				ymax: event["yaxis.range[1]"] ? event["yaxis.range[1]"]: ''
			})
		} else if(JSON.stringify(Object.keys(event).sort()) === '["xaxis.range[0]","xaxis.range[1]"]'){
			this.setState({
				xmin: event["xaxis.range[0]"] ? event["xaxis.range[0]"]: '',
				xmax: event["xaxis.range[1]"] ? event["xaxis.range[1]"]: ''
			})
		} else if(JSON.stringify(Object.keys(event).sort()) === '["yaxis.range[0]","yaxis.range[1]"]'){
			this.setState({
				ymin: event["yaxis.range[0]"] ? event["yaxis.range[0]"]: '',
				ymax: event["yaxis.range[1]"] ? event["yaxis.range[1]"]: ''
			})
		}
	}

	toggleTrace(id){
		let s = {...this.state}
		if(s.counterTraces.includes(id)){
			s.counterTraces.splice(s.counterTraces.indexOf(id), 1)
		} else {
			s.counterTraces = s.counterTraces.concat(id)
		}

		s.refreshData = true
		this.setState(s)
	}

	showTrace(id){
		if(this.state.counterTraces.includes(id)){
			return !this.state.showAll
		} else {
			return this.state.showAll
		}
	}

	toggleAll(){
		let s = {...this.state}
		s.showAll = !s.showAll
		s.counterTraces = []
		s.refreshData = true
		this.setState(s)
	}

	generateAxisTitle(key){
		if(this.units.hasOwnProperty(key)){
			return key + ' [' + this.units[key] +']'
		} else {
			return key
		}
	}

	onAutosuggestChange(message, fieldID, resetLimits, event, change){
		let key = fieldID
		let v = change.newValue
		let s = {...this.state}
		
		s[key] = v
		if(this.vocab[key] && !this.vocab[key].includes(v)){
			helpers.manageStatus.bind(this)('error', message)
			s.refreshData = false
	  	} else {
		  	helpers.manageStatus.bind(this)('ready')
			s.refreshData = true
			if(resetLimits){
				s[key.slice(0,1)+'min'] = ''
				s[key.slice(0,1)+'max'] = ''
			}
		}
		this.setState(s)
	}

	resetAxes(event){
		let s = {...this.state}
		s.refreshData = true
		s[event.target.id.slice(0,1)+'min'] = ''
		s[event.target.id.slice(0,1)+'max'] = ''
		this.setState(s)
	}

	resetAllAxes(event){
		let s = {...this.state}
		s.refreshData = true
		let resets = ['xmin', 'xmax', 'ymin', 'ymax', 'zmin', 'zmax', 'cmin', 'cmax']
		for(let i=0; i<resets.length; i++){
			s[resets[i]] = ''
		}
		this.setState(s)
	}

	render(){
		console.log(this.state)
		let xrange = this.generateRange(this.state.xmin, this.state.xmax, this.state.xKey, this.state.reverseX)
		let yrange = this.generateRange(this.state.ymin, this.state.ymax, this.state.yKey, this.state.reverseY)
		let zrange = this.generateRange(this.state.zmin, this.state.zmax, this.state.zKey, this.state.reverseZ)
		let crange = this.generateRange(this.state.cmin, this.state.cmax, this.state.cKey, this.state.reverseC)

		let colortics = [[],[]]
		if(this.state.cKey === 'timestamp'){
			colortics = helpers.generateTimetics(crange[0], crange[1])
		}

		if(this.state.refreshData){

			// discourage color scale from drawing any number of times other than exactly one
			let scaleDrawn = false
			let needsScale = function(isVisible){
				if(!scaleDrawn && isVisible){
					scaleDrawn = true
					return true
				} else {
					return false
				}
			}

			// generate data and layout
			this.data = this.state.data.map((d,i) => {
					        return {
					          x: d[this.state.xKey],
					          y: d[this.state.yKey],
					          z: this.state.zKey === '[2D plot]' ? [] : d[this.state.zKey],
					          type: this.state.zKey === '[2D plot]' ? 'scatter2d' : 'scatter3d',
					          mode: this.state.connectingLines ? 'markers+lines' : 'markers',
					          line: {
					          	color: 'grey'
					          },
					          marker: {
					          	size: 2,
					          	color: d[this.state.cKey],
					          	colorscale: this.state.cscale,
					          	cmin: crange[0],
					          	cmax: crange[1],
					          	showscale: needsScale(this.showTrace(d._id)),
					          	reversescale: this.state.reverseC,
					          	colorbar: {
					          		title: this.generateAxisTitle(this.state.cKey),
					          		titleside: 'left',
					          		tickmode: this.state.cKey === 'timestamp' ? 'array' : 'auto',
					          		ticktext: colortics[0],
					          		tickvals: colortics[1]
					          	}
					          },
					          name: d._id,
					          visible: this.state.counterTraces.includes(d._id) ? !this.state.showAll : this.state.showAll
					        }
					      })

			this.layout = {
					      	datarevision: Math.random(),
					      	autosize: true, 
					      	showlegend: false,
							xaxis: {
								title: this.generateAxisTitle(this.state.xKey),
								range: xrange,
								type: this.state.xKey === 'timestamp' ? 'date' : '-'
							},
							yaxis: {
								title: this.generateAxisTitle(this.state.yKey),
								range: yrange,
								type: this.state.yKey === 'timestamp' ? 'date' : '-',
							},
						    margin: {t: 30},
					      	scene: {
	    				      	xaxis:{
	    				      		title: this.generateAxisTitle(this.state.xKey),
	    				      		range: xrange,
	    				      		type: this.state.xKey === 'timestamp' ? 'date' : '-'
	    				      	},
						      	yaxis:{
						      		title: this.generateAxisTitle(this.state.yKey),
						      		range: yrange,
						      		type: this.state.yKey === 'timestamp' ? 'date' : '-'
						      	},
						      	zaxis:{
						      		title: this.generateAxisTitle(this.state.zKey),
						      		range: zrange,
						      		type: this.state.zKey === 'timestamp' ? 'date' : '-'
						      	}
						    }
					      }
		}

		return(
			<>
				<div className='row' style={{'width':'100vw'}}>
					<div className='col-3'>
						<fieldset ref={this.formRef}>
							<span id='statusBanner' ref={this.statusReporting} className={'statusBanner busy'}>Downloading...</span>
							<MapContainer style={{'height': '30vh'}} center={[0,0]} zoom={0} scrollWheelZoom={true}>
								<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								{this.state.points}
							</MapContainer>
							<div className='mapSearchInputs overflow-scroll' style={{'height':'55vh'}}>
								<div className='verticalGroup'>
									<h5>Axis Controls</h5>
									<div className="form-floating mb-3">
										<div className="form-text">
						  					<span><b>x-axis variable</b></span>
										</div>
			      						<Autosuggest
									      	id='xKeyAS'
									        suggestions={this.state.xKeySuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'xKeySuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'xKeySuggestions')}
									        shouldRenderSuggestions={x=>true}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'xKey')}
									        inputProps={{placeholder: 'x-axis', value: this.state.xKey, onChange: this.onAutosuggestChange.bind(this, 'Check value of x axis variable', 'xKey', true), id: 'xKey'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
			      						<div className='row'>
			      							<div className='col-6' style={{'paddingRight': '0px'}}>
												<div className="form-text">
								  					<span>min</span>
												</div>
												<input 
													type={this.state.xKey === 'timestamp' ? "date" : "text"} 
													className="form-control minmax" 
													placeholder="Auto" 
													value={this.state.xmin} 
													onChange={e => {this.setState({xmin:e.target.value})}} 
													onBlur={e => {this.setState({xmin:e.target.defaultValue, refreshData: true})}}
													onKeyPress={e => {if(e.key==='Enter'){this.setState({xmin:e.target.defaultValue, refreshData: true})}}}
													aria-label="xmin" 
													aria-describedby="basic-addon1"/>
											</div>
											<div className='col-6' style={{'paddingRight': '0px'}}>
												<div className="form-text">
								  					<span>max</span>
												</div>
												<input 
													type={this.state.xKey === 'timestamp' ? "date" : "text"} 
													className="form-control minmax" 
													placeholder="Auto" 
													value={this.state.xmax} 
													onChange={e => {this.setState({xmax:e.target.value})}} 
													onBlur={e => {this.setState({xmax:e.target.defaultValue, refreshData: true})}}
													onKeyPress={e => {if(e.key==='Enter'){this.setState({xmax:e.target.defaultValue, refreshData: true})}}}
													aria-label="xmax" 
													aria-describedby="basic-addon1"/>
											</div>
										</div>
										<div className='row'>
											<div className='col-5'>
												<div className="form-text">
								  					<span>Reverse x axis</span>
												</div>
												<input className="form-check-input" checked={this.state.reverseX} onChange={(v) => helpers.toggle.bind(this)(v, 'reverseX')} type="checkbox" id='reverseX'></input>
											</div>
											<div className='col-7' style={{'textAlign':'right'}}>
												<button type="button" className="btn btn-outline-primary" style={{'marginTop':'0.75em'}} onClick={event => this.resetAxes(event)} id='xreset'>Reset x Limits</button>
											</div>
										</div>
									</div>

									<hr/>

									<div className="form-floating mb-3">
										<div className="form-text">
						  					<span><b>y-axis variable</b></span>
										</div>
			      						<Autosuggest
									      	id='yKeyAS'
									        suggestions={this.state.yKeySuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'yKeySuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'yKeySuggestions')}
									        shouldRenderSuggestions={x=>true}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'yKey')}
									        inputProps={{placeholder: 'y-axis', value: this.state.yKey, onChange: this.onAutosuggestChange.bind(this, 'Check value of y axis variable', 'yKey', true), id: 'yKey'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
			      						<div className='row'>
			      							<div className='col-6' style={{'paddingRight': '0px'}}>
												<div className="form-text">
								  					<span>min</span>
												</div>
												<input 
													type={this.state.yKey === 'timestamp' ? "date" : "text"} 
													className="form-control minmax" 
													placeholder="Auto" 
													value={this.state.ymin} 
													onChange={e => {this.setState({ymin:e.target.value})}} 
													onBlur={e => {this.setState({ymin:e.target.defaultValue, refreshData: true})}}
													onKeyPress={e => {if(e.key==='Enter'){this.setState({ymin:e.target.defaultValue, refreshData: true})}}}
													aria-label="ymin" 
													aria-describedby="basic-addon1"/>
											</div>
											<div className='col-6' style={{'paddingRight': '0px'}}>
												<div className="form-text">
								  					<span>max</span>
												</div>
												<input 
													type={this.state.yKey === 'timestamp' ? "date" : "text"} 
													className="form-control minmax" 
													placeholder="Auto" 
													value={this.state.ymax} 
													onChange={e => {this.setState({ymax:e.target.value})}} 
													onBlur={e => {this.setState({ymax:e.target.defaultValue, refreshData: true})}}
													onKeyPress={e => {if(e.key==='Enter'){this.setState({ymax:e.target.defaultValue, refreshData: true})}}}
													aria-label="ymax" 
													aria-describedby="basic-addon1"/>
											</div>
										</div>
										<div className='row'>
											<div className='col-5'>
												<div className="form-text">
								  					<span>Reverse y axis</span>
												</div>
												<input className="form-check-input" checked={this.state.reverseY} onChange={(v) => helpers.toggle.bind(this)(v, 'reverseY')} type="checkbox" id='reverseY'></input>
											</div>
											<div className='col-7' style={{'textAlign':'right'}}>
												<button type="button" className="btn btn-outline-primary" style={{'marginTop':'0.75em'}} onClick={event => this.resetAxes(event)} id='yreset'>Reset y Limits</button>
											</div>
										</div>
									</div>

									<hr/>

									<div className="form-floating mb-3">
										<div className="form-text">
						  					<span><b>color variable</b></span>
										</div>
			      						<Autosuggest
									      	id='cKeyAS'
									        suggestions={this.state.cKeySuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'cKeySuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'cKeySuggestions')}
									        shouldRenderSuggestions={x=>true}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'cKey')}
									        inputProps={{placeholder: 'color axis', value: this.state.cKey, onChange: this.onAutosuggestChange.bind(this, 'Check value of color axis variable', 'cKey', true), id: 'cKey'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
			      						<div className='row'>
			      							<div className='col-6' style={{'paddingRight': '0px'}}>
												<div className="form-text">
								  					<span>min</span>
												</div>
												<input 
													type={this.state.cKey === 'timestamp' ? "date" : "text"} 
													className="form-control minmax" 
													placeholder="Auto" 
													value={this.state.cmin} 
													onChange={e => {this.setState({cmin:e.target.value})}} 
													onBlur={e => {this.setState({cmin:e.target.defaultValue, refreshData: true})}}
													onKeyPress={e => {if(e.key==='Enter'){this.setState({cmin:e.target.defaultValue, refreshData: true})}}}
													aria-label="cmin" 
													aria-describedby="basic-addon1"/>
											</div>
											<div className='col-6' style={{'paddingRight': '0px'}}>
												<div className="form-text">
								  					<span>max</span>
												</div>
												<input 
													type={this.state.cKey === 'timestamp' ? "date" : "text"} 
													className="form-control minmax" 
													placeholder="Auto" 
													value={this.state.cmax} 
													onChange={e => {this.setState({cmax:e.target.value})}} 
													onBlur={e => {this.setState({cmax:e.target.defaultValue, refreshData: true})}}
													onKeyPress={e => {if(e.key==='Enter'){this.setState({cmax:e.target.defaultValue, refreshData: true})}}}
													aria-label="cmax" 
													aria-describedby="basic-addon1"/>
											</div>
										</div>
										<div className='row'>
											<div className='col-5'>
												<div className="form-text">
								  					<span>Reverse color axis</span>
												</div>
												<input className="form-check-input" checked={this.state.reverseC} onChange={(v) => helpers.toggle.bind(this)(v, 'reverseC')} type="checkbox" id='reverseC'></input>
											</div>
											<div className='col-7' style={{'textAlign':'right'}}>
												<button type="button" className="btn btn-outline-primary" style={{'marginTop':'0.75em'}} onClick={event => this.resetAxes(event)} id='creset'>Reset color Limits</button>
											</div>
										</div>
										<div className="form-text">
						  					<span>color scale</span>
										</div>
			      						<Autosuggest
									      	id='cscaleAS'
									        suggestions={this.state.cscaleSuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'cscaleSuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'cscaleSuggestions')}
									        shouldRenderSuggestions={x=>true}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'cscale')}
									        inputProps={{placeholder: 'color scale', value: this.state.cscale, onChange: this.onAutosuggestChange.bind(this, 'Check value of color scale variable', 'cscale', false), id: 'cscale'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
									</div>

									<hr/>

									<div className="form-floating mb-3">
										<div className="form-text">
						  					<span><b>z-axis variable</b></span>
										</div>
			      						<Autosuggest
									      	id='zKeyAS'
									        suggestions={this.state.zKeySuggestions}
									        onSuggestionsFetchRequested={helpers.onSuggestionsFetchRequested.bind(this, 'zKeySuggestions')}
									        onSuggestionsClearRequested={helpers.onSuggestionsClearRequested.bind(this, 'zKeySuggestions')}
									        shouldRenderSuggestions={x=>true}
									        getSuggestionValue={helpers.getSuggestionValue}
									        renderSuggestion={helpers.renderSuggestion.bind(this, 'zKey')}
									        inputProps={{placeholder: 'z-axis', value: this.state.zKey, onChange: this.onAutosuggestChange.bind(this, 'Check value of z axis variable', 'zKey', true), id: 'zKey'}}
									        theme={{input: 'form-control', suggestionsList: 'list-group', suggestion: 'list-group-item'}}
			      						/>
										<div className={this.state.zKey === '[2D plot]' ? "input-group mb-3 hidden": "input-group mb-3"} style={{'marginTop':'1em'}}>
				      						<div className='row'>
				      							<div className='col-6' style={{'paddingRight': '0px'}}>
													<div className="form-text">
									  					<span>min</span>
													</div>
													<input 
														type={this.state.zKey === 'timestamp' ? "date" : "text"} 
														className="form-control minmax" 
														placeholder="Auto" 
														value={this.state.zmin} 
														onChange={e => {this.setState({zmin:e.target.value})}} 
														onBlur={e => {this.setState({zmin:e.target.defaultValue, refreshData: true})}}
														onKeyPress={e => {if(e.key==='Enter'){this.setState({zmin:e.target.defaultValue, refreshData: true})}}}
														aria-label="zmin" 
														aria-describedby="basic-addon1"/>
												</div>
												<div className='col-6' style={{'paddingRight': '0px'}}>
													<div className="form-text">
									  					<span>max</span>
													</div>
													<input 
														type={this.state.zKey === 'timestamp' ? "date" : "text"} 
														className="form-control minmax" 
														placeholder="Auto" 
														value={this.state.zmax} 
														onChange={e => {this.setState({zmax:e.target.value})}} 
														onBlur={e => {this.setState({zmax:e.target.defaultValue, refreshData: true})}}
														onKeyPress={e => {if(e.key==='Enter'){this.setState({zmax:e.target.defaultValue, refreshData: true})}}}
														aria-label="zmax" 
														aria-describedby="basic-addon1"/>
												</div>
											</div>
											<div className='row'>
												<div className='col-5'>
													<div className="form-text">
									  					<span>Reverse z axis</span>
													</div>
													<input className="form-check-input" checked={this.state.reverseZ} onChange={(v) => helpers.toggle.bind(this)(v, 'reverseZ')} type="checkbox" id='reverseZ'></input>
												</div>
												<div className='col-7' style={{'textAlign':'right'}}>
													<button type="button" className="btn btn-outline-primary" style={{'marginTop':'0.75em'}} onClick={event => this.resetAxes(event)} id='zreset'>Reset z Limits</button>
												</div>
											</div>
										</div>
									</div>

									<hr/>

									<h5>Global Options</h5>
									<div className="form-floating mb-3">
										<div className='row'>
											<div className='col-5'>
												<div className="form-text">
								  					<span>Connecting lines</span>
												</div>
												<input className="form-check-input" checked={this.state.connectingLines} onChange={(v) => helpers.toggle.bind(this)(v, 'connectingLines')} type="checkbox" id='connectingLines'></input>
											</div>
											<div className='col-7' style={{'textAlign':'right'}}>
												<button type="button" className="btn btn-outline-primary" style={{'marginTop':'0.75em'}} onClick={event => this.resetAllAxes(event)} id='allreset'>Reset all axes</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</fieldset>
					</div>

					{/* plots */}
					<div className='col-9'>
					    <Plot
					      data={this.data}
					      onRelayout={e=>this.zoomSync(e)}
					      layout={this.layout}
					      style={{width: '100%', height: '90vh'}}
					      config={{showTips: false}}
					    />
					</div>
				</div>
				<hr/>
				<div className='row' style={{'width':'100vw'}}>
					<div className='col-12' style={{'paddingLeft': '2em', 'paddingRight': '5em', 'height': '50vh', 'overflow': 'scroll'}}>
						<h5>Profiles</h5>
						<a className="btn btn-primary" role='button' style={{'marginRight': '1em'}} href={this.csv} download={'argo'+this.state.argoPlatform+'.csv'}>Download Table CSV</a>
						<a className="btn btn-primary" role='button' style={{'marginRight': '1em'}} href={this.json} download={'argo'+this.state.argoPlatform+'.json'}>Download Complete JSON</a>
						<a className="btn btn-primary" role='button' style={{'marginRight': '1em'}} href={'https://www.ocean-ops.org/board/wa/Platform?ref='+this.state.argoPlatform} target="_blank" rel="noopener noreferrer">{'Ocean Ops Page for float ID '+this.state.argoPlatform}</a>
						<table className='table'>
							<thead style={{'position': 'sticky', 'top': 0, 'backgroundColor': '#FFFFFF'}}>
							    <tr>
							    	<th scope="col">
							    		<span style={{'marginRight':'0.5em'}}>Show</span>
										<input className="form-check-input" checked={this.state.showAll} onChange={(v) => this.toggleAll() } type="checkbox"></input>
							    	</th>
							    	{this.header.map(item => {return <th key={Math.random()} scope="col">{item}</th>})}
							    </tr>
							</thead>
							<tbody>
								{this.rows.map(r => {
									return(
										<tr key={Math.random()}>
											<td>
												<input className="form-check-input" checked={this.showTrace(r[0])} onChange={(v) => this.toggleTrace(r[0])} type="checkbox" id={r[0]}></input>
											</td>
											{r.map((item,i) => {return <td key={Math.random()}>{this.transforms[i](item)}</td>})}
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>
			</>
		)
	}
}

export default AVPlots