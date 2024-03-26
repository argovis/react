import React from 'react';
import { MapContainer, TileLayer, Popup, Polygon, FeatureGroup} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import '../index.css';
import helpers from'./helpers'

class ArgovisExplore extends React.Component {
		// top level element for the Argovis landing page
    constructor(props) {
      super(props);

      let q = new URLSearchParams(window.location.search) // parse out query string
      document.title = 'Argovis - Colocate datasets'

			// limits for polygon / time coupling
			this.minDays = 90
			this.maxDays = 365
			this.minArea = 1000000
			this.maxArea = 10000000
			this.defaultDayspan = 10
			this.defaultPolygon = helpers.insertPointsInPolygon([[-97.673601848372,22.885110124806],[-102.96337821312578,29.423999093502953],[-101.90542294017503,35.08813382357759],[-96.49809598953782,39.66434175349062],[-90.62056669536695,43.70195227382903],[-82.50957626941113,47.56429889487994],[-74.3985858434553,49.739009952924114],[-64.52433662924821,50.716917706856776],[-57.00109913270949,50.4181580475676],[-47.24440050438584,48.74098923312187],[-39.72116300784711,46.36057030355044],[-33.72608312779282,43.18971187199796],[-27.263085342297984,36.613054011709224],[-26.086555175241674,29.11626649340519],[-30.08675774323312,21.360090709822067],[-38.087162879216116,14.654857870125182],[-47.61705723237225,10.524339189723026],[-58.794093819407266,9.250074393405415],[-68.79460023938596,11.447818472507375],[-72.79480280737744,12.94196371139217],[-77.50092347560269,9.598086459248549],[-81.50112604359414,9.829896891316018],[-83.38357431088428,11.332543160952566],[-83.26592129417863,14.768594001462352],[-85.26602257817437,16.805273170537433],[-88.56030704593205,16.467266454192085],[-87.14847084546449,20.15056092317585],[-87.14847084546449,22.12466319561307],[-90.08979626310527,21.360090709822067],[-92.20755056380663,18.93158885095828],[-95.50183503156434,19.375913925110194],[-97.673601848372,22.885110124806]])
			this.defaultDayspan = helpers.calculateDayspan.bind(this)({'polygon':this.defaultPolygon})

      this.state = {
      	apiKey: localStorage.getItem('apiKey') ? localStorage.getItem('apiKey') : 'guest',					// user's API key, if provided
       	points: {									// arrays of points to paint for each dataset
       		'argo': [],
       		'cchdo': [],
       		'drifters': [],
       		'tc': []
       	},
       	urls: {										// URLs to query for each dataset
       		'argo': [],
       		'cchdo': [],
       		'drifters': [],
       		'tc': []
       	},
       	rawPoints: {
       		'argo': [],
       		'cchdo': [],
       		'drifters': [],
       		'tc': []
       	},
       	maxDayspan: q.has('polygon') ? helpers.calculateDayspan.bind(this)( {'polygon':JSON.parse(q.get('polygon'))} ) : this.defaultDayspan,
       	polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : this.defaultPolygon, // [[lon0, lat0], [lon1, lat1], ..., [lonn,latn], [lon0,lat0]]
       	interpolated_polygon: q.has('polygon') ? helpers.insertPointsInPolygon(JSON.parse(q.get('polygon'))) : this.defaultPolygon,
       	refreshData: true,
       	argocore: q.has('argocore') ? q.get('argocore') === 'true' : false,
       	argobgc: q.has('argobgc') ? q.get('argobgc') === 'true' : false,
       	argodeep: q.has('argodeep') ? q.get('argodeep') === 'true' : false,
       	woce: q.has('woce') ? q.get('woce') === 'true' : false,
       	goship: q.has('goship') ? q.get('goship') === 'true' : false,
       	cchdoother: q.has('cchdoother') ? q.get('cchdoother') === 'true' : false,
       	drifters: q.has('drifters') ? q.get('drifters') === 'true' : false,
       	tc: q.has('tc') ? q.get('tc') === 'true' : false,
       	centerlon: q.has('centerlon') ? parseFloat(q.get('centerlon')) : -70
      }
      this.customQueryParams = ['startDate', 'endDate', 'polygon', 'argocore', 'argobgc', 'argodeep', 'cchdoother', 'woce', 'goship', 'drifters', 'tc', 'centerlon']

      helpers.mungeTime.bind(this)(q, this.state.maxDayspan+1) // +1 since we include the end date here.

      if(!window.location.search){
      	console.log('imposing defaults')
      	this.state.argocore = true
      	this.state.argobgc = true
      	this.state.argodeep = true
      	this.state.tc = true
      	this.state.goship = true
      	this.state.startDate = '2017-04-01'
      	this.state.endDate = '2017-06-30'
      }

      this.formRef = React.createRef()
      this.fgRef = React.createRef()

      this.statusReporting = React.createRef()
      this.apiPrefix = 'https://argovis-api.colorado.edu/'
      this.drifterApiPrefix = 'https://argovisbeta01.colorado.edu/dapi/'
      this.vocab = {}
      this.wocelineLookup = {}
      this.wocegroupLookup = {}

			helpers.setQueryString.bind(this)()

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
						this.setState({refreshData:true})
					}
				})
			})
    }

    componentDidMount(){
    	this.componentDidUpdate()
    }

    componentDidUpdate(prevProps, prevState, snapshot){
    	if(this.state.refreshData){
    		if(this.statusReporting.current){
					helpers.manageStatus.bind(this)('downloading')
				}
				let s = {...this.state}
				// reformualte all URLs
				let urls = {
					'argo': this.generateArgoURLs(),
					'cchdo': this.generateCCHDOURLs(),
					'drifters':  this.generateDrifterURLs(),
					'tc': this.generateTCURLs()
				}
				let refresh = [] 		// list of urls that will actually need to be refreshed

				//compare new URLs to old URLs; any that are new, add them to a to-be-updated list, and update urls in state
				for(let dataset in urls){

					if(urls[dataset].length === 0){
						// no data for this dataset, turn it off and zero out its points
						s.urls[dataset] = []
						s.points[dataset] = []
						continue
					}

					if(JSON.stringify(urls[dataset].sort())!==JSON.stringify(s.urls[dataset].sort()) || (prevState && this.state.apiKey !== prevState.apiKey) ){
						// urls have changed and aren't blank OR api key has changed, need to hit the api
						refresh = refresh.concat(urls[dataset])
						s.urls[dataset] = urls[dataset]
					}
				}

				if(refresh.length === 0){
					helpers.manageStatus.bind(this)('ready')

					for(let i=0; i<Object.keys(s.rawPoints).length; i++){
						let dataset = Object.keys(s.rawPoints)[i]
						s.points[dataset] = helpers.circlefy.bind(this)(s.rawPoints[dataset], s)
					}

					helpers.refreshMap.bind(this)(s)
				} else {
					//promise all across a `fetch` for all new URLs, and update CircleMarkers for all new fetches
					Promise.all(refresh.map(x => fetch(x, {headers:{'x-argokey': s.apiKey}}))).then(responses => {
						let datasets = responses.map(x => this.findDataset(x.url))
						Promise.all(responses.map(res => res.json())).then(data => {
							let newPoints = {}
							let newRawPoints = {}
							for(let i=0; i<data.length; i++){
								let bail = helpers.handleHTTPcodes.bind(this)(data[i].code)
								if(bail){
									return
								}
								if(data.length>0 && data[i].length>0){
									let points = data[i].map(x => x.concat([datasets[i]])) // so there's something in the source position for everything other than argo
									let rawPoints = JSON.parse(JSON.stringify(points))
									points = helpers.circlefy.bind(this)(points, s)
									if(points){
										if(newPoints.hasOwnProperty(datasets[i])){
											newPoints[datasets[i]] = newPoints[datasets[i]].concat(points)
										} else {
											newPoints[datasets[i]] = points
										}

										// preserve these for reprocessing in case center longitude moves
										if(newRawPoints.hasOwnProperty(datasets[i])){
											newRawPoints[datasets[i]] = newRawPoints[datasets[i]].concat(rawPoints)
										} else {
											newRawPoints[datasets[i]] = rawPoints
										}
									}
								} else {
									newPoints[datasets[i]] = []
									newRawPoints[datasets[i]] = []
								}
							}

							s.points = {...s.points, ...newPoints}
							s.rawPoints = {...s.rawPoints, ...newRawPoints}
							helpers.manageStatus.bind(this)('rendering')
							if(Object.keys(newPoints).length>0){
								helpers.refreshMap.bind(this)(s)
							}
						})
					})
				}
			}
			helpers.setQueryString.bind(this)()
    }

    lookingForEntity(){
    	return false
    }

    // input handlers
    toggle(v){
    	let nextState = {...this.state}
    	nextState[v.target.id] = !nextState[v.target.id]
      this.recalculateTemporospatialLimits.bind(this)(nextState)
    	let s = helpers.manageAllowedDates.bind(this)(this.state.polygon)

    	s[v.target.id] = !s[v.target.id]
    	s.refreshData = true
    	this.setState(s)
    }

    setToken(key, v){
    	// key: state key labeling this input token
    	// v: new value being considered
    	let s = {...this.state}
    	
  	  s[key] = v
  	  s.refreshData = true

    	this.setState(s)
    }

    refreshMap(needNewData){
  		if(needNewData){
    		helpers.manageStatus.bind(this)('downloading')
    	} else {
    		helpers.manageStatus.bind(this)('rendering')
    	}

    	this.setState({refreshData: needNewData}, () => {
				helpers.manageStatus.bind(this)('ready')
			})
    }

    // API URL generation
    generateArgoURLs() {
    	if(!this.state.argocore && !this.state.argobgc && !this.state.argodeep){
    		return []
    	}

    	let url = helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'argo', this.state)

    	// decide on source.source
    	let source = []
    	if(!this.state.argocore && !this.state.argobgc && !this.state.argodeep){
    		return []
    	} else if(this.state.argocore && this.state.argobgc && this.state.argodeep){
    		source = ['argo_core']
    	} else if(this.state.argocore && this.state.argobgc && !this.state.argodeep){
    		source = ['argo_core,~argo_deep', 'argo_bgc']
    	} else if(this.state.argocore && !this.state.argobgc && this.state.argodeep){
    		source = ['argo_core,~argo_bgc', 'argo_deep']
    	} else if(!this.state.argocore && this.state.argobgc && this.state.argodeep){
    		source = ['argo_bgc', 'argo_deep']
    	} else if(this.state.argocore && !this.state.argobgc && !this.state.argodeep){
    		source = ['argo_core,~argo_bgc,~argo_deep']
    	} else if(!this.state.argocore && this.state.argobgc && !this.state.argodeep){
    		source = ['argo_bgc']
    	} else if(!this.state.argocore && !this.state.argobgc && this.state.argodeep){
    		source = ['argo_deep']
    	}

    	if(source.length === 0){
    		return [url]
    	} else{
    		return source.map(x => url+'&source='+x)
    	}
	    
    }

    generateCCHDOURLs() {
    	if(!this.state.woce && !this.state.goship && !this.state.cchdoother){
    		return []
    	}

    	let url = helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'cchdo', this.state)

	    // decide on source.source
	    let source = []
	    if(this.state.cchdoother && this.state.woce && this.state.goship){
	    	source = []
	    } else if(this.state.cchdoother && this.state.woce && !this.state.goship){
	    	source = ['~cchdo_woce,~cchdo_go-ship', 'cchdo_woce']
	    } else if(this.state.cchdoother && !this.state.woce && this.state.goship){
	    	source = ['~cchdo_woce,~cchdo_go-ship', 'cchdo_go-ship']
	    } else if(!this.state.cchdoother && this.state.woce && this.state.goship){
	    	source = ['cchdo_go-ship', 'cchdo_woce']
	    } else if(this.state.cchdoother && !this.state.woce && !this.state.goship){
	    	source = ['~cchdo_go-ship,~cchdo_woce']
	    } else if(!this.state.cchdoother && this.state.woce && !this.state.goship){
	    	source = ['cchdo_woce']
	    } else if(!this.state.cchdoother && !this.state.woce && this.state.goship){
	    	source = ['cchdo_go-ship']
	    }

	    if(source.length === 0){
	    	return [url]
	    } else{
	    	return source.map(x => url+'&source='+x)
	    }
    }

    generateDrifterURLs(){
    	if(!this.state.drifters){
    		return []
    	}

    	let url = helpers.generateTemporoSpatialURL.bind(this)(this.drifterApiPrefix, 'drifters', this.state)

    	return [url]
    }

    generateTCURLs(){
    	if(!this.state.tc){
    		return []
    	}

    	let url = helpers.generateTemporoSpatialURL.bind(this)(this.apiPrefix, 'tc', this.state)

    	return [url]
    }

    generateURLs(){
    	let urls = this.generateArgoURLs().concat(this.generateCCHDOURLs()).concat(this.generateDrifterURLs()).concat(this.generateTCURLs())
    	return urls
    }

    genPlotURLs(point, state){
    	if(point[point.length-1] === 'argo'){
    		let regionLink = helpers.genRegionLink(state.polygon, state.startDate, state.endDate, state.centerlon, 'argo')
    		return <div><a target="_blank" rel="noreferrer" href={'/plots/argo?showAll=true&argoPlatform='+point[0].split('_')[0]+'&centerlon='+this.state.centerlon}>Platform Page</a><br /><a target="_blank" rel="noreferrer" href={'/plots/argo?argoPlatform='+point[0].split('_')[0]+'&counterTraces=["'+point[0]+'"]&centerlon='+this.state.centerlon}>Profile Page</a>{regionLink}</div>
    	} else if (point[point.length-1] === 'tc'){
    		let regionLink = helpers.genRegionLink(state.polygon, state.startDate, state.endDate, state.centerlon, 'tc')
    		return <div><a target="_blank" rel="noreferrer" href={'/plots/tc?showAll=true&tcMeta='+point[0].split('_')[0]+'&centerlon='+this.state.centerlon}>Cyclone Page</a>{regionLink}</div>
    	} else if (point[point.length-1] === 'cchdo'){

    		// determine the woceline occupancies for this point, if any; give an extra hour on either end to capture edges. 
    		let woceoccupy = point[5].map(x => {
    			let timespan = helpers.determineWoceGroup(x, new Date(point[3]), this.wocegroupLookup)
    			timespan[0].setHours(timespan[0].getHours() - 1)
    			timespan[1].setHours(timespan[1].getHours() + 1)
    			return [x].concat(timespan)
    		})

    		let regionLink = helpers.genRegionLink(state.polygon, state.startDate, state.endDate, state.centerlon, 'ships')

				return <div>{woceoccupy.map(x => {return(<span key={Math.random()}><a target="_blank" rel="noreferrer" href={'/plots/ships?showAll=true&woceline='+x[0]+'&startDate=' + x[1].toISOString().replace('.000Z', 'Z') + '&endDate=' + x[2].toISOString().replace('.000Z', 'Z')+'&centerlon='+this.state.centerlon}>{'Plots for ' + x[3]}</a><br /></span>)})} <a target="_blank" rel="noreferrer" href={'/plots/ships?showAll=true&cruise='+point[6]+'&centerlon='+this.state.centerlon}>{'Plots for cruise ' + point[6]}</a><br /><a target="_blank" rel="noreferrer" href={'/plots/ships?cruise='+point[6]+'&centerlon='+this.state.centerlon+'&counterTraces=["'+point[0]+'"]'}>Profile Page</a>{regionLink}</div>
    	}
    }

    genTooltip(point){
    	return(
		    <Popup>
		      ID: {point[0]} <br />
		      Long / Lat: {helpers.mungePrecision(point[1])} / {helpers.mungePrecision(point[2])} <br />
		      Date: {point[3]}<br />
		      {this.genPlotURLs(point, this.state)}
		    </Popup>
    	)
    }

    // leaflet helpers
    chooseColor(datasources){

    	let ds = []
    	if(datasources[datasources.length-1] === 'argo') {
    		ds = datasources[4]
    	} else if(datasources[datasources.length-1] === 'cchdo') {
    		ds = datasources[4]
    	} else if(datasources[datasources.length-1] === 'drifters') {
    		ds = ['drifters']
    	} else if(datasources[datasources.length-1] === 'tc') {
    		ds = ['tc']
    	} 

    	if(ds.includes('argo_bgc')){
    		return 'green'
    	}
    	else if(ds.includes('argo_deep')){
    		return 'blue'
    	}
    	else if(ds.includes('argo_core')){
	    	return 'yellow'
	    }
	    else if(ds.includes('drifters')){
	    	return 'black'
	    }
	    else if(ds.includes('tc')){
	    	return 'red'
	    }
	    else if(ds.includes('cchdo_woce')){
	    	return 'orange'
	    }
	    else if(ds.includes('cchdo_go-ship')){
	    	return 'magenta'
	    }
	    else{
	    	return '#999999'
	    }
    }

    // misc helpers
    findDataset(url){
    	let u = url.slice(this.apiPrefix.length)
    	u = u.slice(0,u.search('[?].'))
    	return u
    }

    recalculateTemporospatialLimits(s){
    	let minDays = []
    	let minArea = []
    	let maxArea = []
    	if(s.argocore || s.argobgc || s.argodeep){
    		minDays.push(10)
    		minArea.push(1000000)
    		maxArea.push(10000000)
    	}
    	if(s.cchdo){
    		minDays.push(30)
    		minArea.push(1000000)
    		maxArea.push(10000000)
    	}
    	if(s.drifters){
    		minDays.push(0)
    		minArea.push(100000)
    		maxArea.push(1000000)
    	}
    	if(s.tc){
    		minDays.push(30)
    		minArea.push(1000000)
    		maxArea.push(10000000)
    	}

    	this.minDays = Math.min(...minDays)
    	this.minArea = Math.min(...minArea)
    	this.maxArea = Math.min(...maxArea)
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
					{/*search option sidebar*/}
					<div className='col-lg-3 order-last order-lg-first'>
						<fieldset ref={this.formRef}>
							<span id='statusBanner' ref={this.statusReporting} className='statusBanner busy'>Downloading...</span>
							<div className='mapSearchInputs scrollit' style={{'height':'90vh'}}>
									<h5>Colocate datasets</h5>
									<div className='verticalGroup'>
										<div className="form-floating mb-3">
											<input type="password" className="form-control" id="apiKey" placeholder="" value={this.state.apiKey} onInput={(v) => helpers.setToken.bind(this)('apiKey', v.target.value, null, true)}></input>
											<label htmlFor="apiKey">API Key</label>
											<div id="apiKeyHelpBlock" className="form-text">
							  					<a target="_blank" rel="noreferrer" href='https://argovis-keygen.colorado.edu/'>Get a free API key</a>
											</div>
										</div>

										<h6>Time range</h6>
										<div className="form-floating mb-3">
											<input 
												type="date" 
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

								<h6>Dataset Filters</h6>

				      	<div className='verticalGroup'>
				      		<h6 style={{'color': '#888888'}}>Argo</h6>
					        <div className="form-check">
										<input className="form-check-input" checked={this.state.argocore} onChange={(v) => this.toggle(v)} type="checkbox" id='argocore'></input>
										<label className="form-check-label" htmlFor='Argo Core'>Display Argo Core <span style={{'color':this.chooseColor([null,null,null,null,['argo_core'],'argo']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
						    	<div className="form-check">
										<input className="form-check-input" checked={this.state.argobgc} onChange={(v) => this.toggle(v)} type="checkbox" id='argobgc'></input>
										<label className="form-check-label" htmlFor='Argo BGC'>Display Argo BGC <span style={{'color':this.chooseColor([null,null,null,null,['argo_bgc'],'argo']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
			        		<div className="form-check">
										<input className="form-check-input" checked={this.state.argodeep} onChange={(v) => this.toggle(v)} type="checkbox" id='argodeep'></input>
										<label className="form-check-label" htmlFor='Argo Deep'>Display Argo Deep <span style={{'color':this.chooseColor([null,null,null,null,['argo_deep'],'argo']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
								</div>

				      	<div className='verticalGroup'>
				      		<h6 style={{'color': '#888888'}}>Ship-based profiles</h6>
					        <div className="form-check">
										<input className="form-check-input" checked={this.state.woce} onChange={(v) => this.toggle(v)} type="checkbox" id='woce'></input>
										<label className="form-check-label" htmlFor='woce'>Display WOCE <span style={{'color':this.chooseColor([null,null,null,null,['cchdo_woce'],'cchdo']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
						    	<div className="form-check">
										<input className="form-check-input" checked={this.state.goship} onChange={(v) => this.toggle(v)} type="checkbox" id='goship'></input>
										<label className="form-check-label" htmlFor='goship'>Display GO-SHIP <span style={{'color':this.chooseColor([null,null,null,null,['cchdo_go-ship'],'cchdo']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
			        		<div className="form-check">
										<input className="form-check-input" checked={this.state.cchdoother} onChange={(v) => this.toggle(v)} type="checkbox" id='cchdoother'></input>
										<label className="form-check-label" htmlFor='cchdoother'>Display other ships <span style={{'color':this.chooseColor([null,null,null,null,['cchdo_xxx'],'cchdo']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
								</div>

								<div className='verticalGroup'>
									<h6 style={{'color': '#888888'}}>Global drifter program</h6>
									<div className="form-check">
										<input className="form-check-input" checked={this.state.drifters} onChange={(v) => this.toggle(v)} type="checkbox" id='drifters'></input>
										<label className="form-check-label" htmlFor='Drifters'>Display drifters <span style={{'color':this.chooseColor(['drifters']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
								</div>

								<div className='verticalGroup'>
									<h6 style={{'color': '#888888'}}>Tropical cyclones</h6>
									<div className="form-check">
										<input className="form-check-input" checked={this.state.tc} onChange={(v) => this.toggle(v)} type="checkbox" id='tc'></input>
										<label className="form-check-label" htmlFor='Tropical Cyclones'>Display tropical cyclones <span style={{'color':this.chooseColor(['tc']), 'WebkitTextStroke': '1px black'}}>&#9679;</span></label>
									</div>
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
                                polygon: {
                    							shapeOptions: {
                    								fillOpacity: 0
                    							}
                    						}
						      }}
						      edit={{
										edit: false
									}}
						    />
						    <Polygon key={Math.random()} positions={this.state.interpolated_polygon.map(x => [x[1],helpers.mutateLongitude(x[0], this.state.centerlon)])} fillOpacity={0}></Polygon>
						  </FeatureGroup>
						  {this.state.points.argo}
						  {this.state.points.cchdo}
						  {this.state.points.drifters}
						  {this.state.points.tc}
						</MapContainer>
					</div>
				</div>
			</>
		)
	}
}

export default ArgovisExplore