import React from 'react';
import { MapContainer, TileLayer, Tooltip, Polygon, FeatureGroup, Rectangle} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import '../index.css';
import chroma from "chroma-js";

class Grids extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      	grid: [],
      	raw: [],
      	polygon: [[-52.382812,53.225768],[-62.050781,48.107431],[-72.773438,43.325178],[-77.695313,37.996163],[-81.5625,32.990236],[-82.089844,27.683528],[-78.925781,22.755921],[-71.547389,23.008026],[-64.160156,22.917923],[-57.673458,28.712256],[-50.449219,34.161818],[-40.078125,44.590467],[-35.683594,51.618017],[-43.066406,54.265224],[-52.382812,53.225768]],
      	levelindex: {
      		'temperature_rg': 0,
      		'salinity_rg': 0,
      		'ohc_kg': 0
      	},
      	timestep: {
      		'temperature_rg': "2004-01-15",
      		'salinity_rg': "2004-01-15",
      		'ohc_kg': "2005-01-15"
      	},
      	selectedGrid: 'temperature_rg',
      	status: 'ready'
      }
      this.levels = {
      	'temperature_rg': this.constructLevelOptions([2.5,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,182.5,200,220,240,260,280,300,320,340,360,380,400,420,440,462.5,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1412.5,1500,1600,1700,1800,1900,1975]),
      	'salinity_rg': this.constructLevelOptions([2.5,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,182.5,200,220,240,260,280,300,320,340,360,380,400,420,440,462.5,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1412.5,1500,1600,1700,1800,1900,1975]),
      	'ohc_kg': this.constructLevelOptions([15])
      }
      this.timesteps = {
      	'temperature_rg': this.constructDateOptions(["2004-01-15","2004-02-15","2004-03-15","2004-04-15","2004-05-15","2004-06-15","2004-07-15","2004-08-15","2004-09-15","2004-10-15","2004-11-15","2004-12-15","2005-01-15","2005-02-15","2005-03-15","2005-04-15","2005-05-15","2005-06-15","2005-07-15","2005-08-15","2005-09-15","2005-10-15","2005-11-15","2005-12-15","2006-01-15","2006-02-15","2006-03-15","2006-04-15","2006-05-15","2006-06-15","2006-07-15","2006-08-15","2006-09-15","2006-10-15","2006-11-15","2006-12-15","2007-01-15","2007-02-15","2007-03-15","2007-04-15","2007-05-15","2007-06-15","2007-07-15","2007-08-15","2007-09-15","2007-10-15","2007-11-15","2007-12-15","2008-01-15","2008-02-15","2008-03-15","2008-04-15","2008-05-15","2008-06-15","2008-07-15","2008-08-15","2008-09-15","2008-10-15","2008-11-15","2008-12-15","2009-01-15","2009-02-15","2009-03-15","2009-04-15","2009-05-15","2009-06-15","2009-07-15","2009-08-15","2009-09-15","2009-10-15","2009-11-15","2009-12-15","2010-01-15","2010-02-15","2010-03-15","2010-04-15","2010-05-15","2010-06-15","2010-07-15","2010-08-15","2010-09-15","2010-10-15","2010-11-15","2010-12-15","2011-01-15","2011-02-15","2011-03-15","2011-04-15","2011-05-15","2011-06-15","2011-07-15","2011-08-15","2011-09-15","2011-10-15","2011-11-15","2011-12-15","2012-01-15","2012-02-15","2012-03-15","2012-04-15","2012-05-15","2012-06-15","2012-07-15","2012-08-15","2012-09-15","2012-10-15","2012-11-15","2012-12-15","2013-01-15","2013-02-15","2013-03-15","2013-04-15","2013-05-15","2013-06-15","2013-07-15","2013-08-15","2013-09-15","2013-10-15","2013-11-15","2013-12-15","2014-01-15","2014-02-15","2014-03-15","2014-04-15","2014-05-15","2014-06-15","2014-07-15","2014-08-15","2014-09-15","2014-10-15","2014-11-15","2014-12-15","2015-01-15","2015-02-15","2015-03-15","2015-04-15","2015-05-15","2015-06-15","2015-07-15","2015-08-15","2015-09-15","2015-10-15","2015-11-15","2015-12-15","2016-01-15","2016-02-15","2016-03-15","2016-04-15","2016-05-15","2016-06-15","2016-07-15","2016-08-15","2016-09-15","2016-10-15","2016-11-15","2016-12-15","2017-01-15","2017-02-15","2017-03-15","2017-04-15","2017-05-15","2017-06-15","2017-07-15","2017-08-15","2017-09-15","2017-10-15","2017-11-15","2017-12-15","2018-01-15","2018-02-15","2018-03-15","2018-04-15","2018-05-15","2018-06-15","2018-07-15","2018-08-15","2018-09-15","2018-10-15","2018-11-15","2018-12-15","2019-01-15","2019-02-15","2019-03-15","2019-04-15","2019-05-15","2019-06-15","2019-07-15","2019-08-15","2019-09-15","2019-10-15","2019-11-15","2019-12-15","2020-01-15","2020-02-15","2020-03-15","2020-04-15","2020-05-15","2020-06-15","2020-07-15","2020-08-15","2020-09-15","2020-10-15","2020-11-15","2020-12-15","2021-01-15","2021-02-15","2021-03-15","2021-04-15","2021-05-15","2021-06-15","2021-07-15","2021-08-15","2021-09-15","2021-10-15","2021-11-15","2021-12-15","2022-01-15","2022-02-15","2022-03-15","2022-04-15","2022-05-15"]),
      	'salinity_rg': this.constructDateOptions(["2004-01-15","2004-02-15","2004-03-15","2004-04-15","2004-05-15","2004-06-15","2004-07-15","2004-08-15","2004-09-15","2004-10-15","2004-11-15","2004-12-15","2005-01-15","2005-02-15","2005-03-15","2005-04-15","2005-05-15","2005-06-15","2005-07-15","2005-08-15","2005-09-15","2005-10-15","2005-11-15","2005-12-15","2006-01-15","2006-02-15","2006-03-15","2006-04-15","2006-05-15","2006-06-15","2006-07-15","2006-08-15","2006-09-15","2006-10-15","2006-11-15","2006-12-15","2007-01-15","2007-02-15","2007-03-15","2007-04-15","2007-05-15","2007-06-15","2007-07-15","2007-08-15","2007-09-15","2007-10-15","2007-11-15","2007-12-15","2008-01-15","2008-02-15","2008-03-15","2008-04-15","2008-05-15","2008-06-15","2008-07-15","2008-08-15","2008-09-15","2008-10-15","2008-11-15","2008-12-15","2009-01-15","2009-02-15","2009-03-15","2009-04-15","2009-05-15","2009-06-15","2009-07-15","2009-08-15","2009-09-15","2009-10-15","2009-11-15","2009-12-15","2010-01-15","2010-02-15","2010-03-15","2010-04-15","2010-05-15","2010-06-15","2010-07-15","2010-08-15","2010-09-15","2010-10-15","2010-11-15","2010-12-15","2011-01-15","2011-02-15","2011-03-15","2011-04-15","2011-05-15","2011-06-15","2011-07-15","2011-08-15","2011-09-15","2011-10-15","2011-11-15","2011-12-15","2012-01-15","2012-02-15","2012-03-15","2012-04-15","2012-05-15","2012-06-15","2012-07-15","2012-08-15","2012-09-15","2012-10-15","2012-11-15","2012-12-15","2013-01-15","2013-02-15","2013-03-15","2013-04-15","2013-05-15","2013-06-15","2013-07-15","2013-08-15","2013-09-15","2013-10-15","2013-11-15","2013-12-15","2014-01-15","2014-02-15","2014-03-15","2014-04-15","2014-05-15","2014-06-15","2014-07-15","2014-08-15","2014-09-15","2014-10-15","2014-11-15","2014-12-15","2015-01-15","2015-02-15","2015-03-15","2015-04-15","2015-05-15","2015-06-15","2015-07-15","2015-08-15","2015-09-15","2015-10-15","2015-11-15","2015-12-15","2016-01-15","2016-02-15","2016-03-15","2016-04-15","2016-05-15","2016-06-15","2016-07-15","2016-08-15","2016-09-15","2016-10-15","2016-11-15","2016-12-15","2017-01-15","2017-02-15","2017-03-15","2017-04-15","2017-05-15","2017-06-15","2017-07-15","2017-08-15","2017-09-15","2017-10-15","2017-11-15","2017-12-15","2018-01-15","2018-02-15","2018-03-15","2018-04-15","2018-05-15","2018-06-15","2018-07-15","2018-08-15","2018-09-15","2018-10-15","2018-11-15","2018-12-15","2019-01-15","2019-02-15","2019-03-15","2019-04-15","2019-05-15","2019-06-15","2019-07-15","2019-08-15","2019-09-15","2019-10-15","2019-11-15","2019-12-15","2020-01-15","2020-02-15","2020-03-15","2020-04-15","2020-05-15","2020-06-15","2020-07-15","2020-08-15","2020-09-15","2020-10-15","2020-11-15","2020-12-15","2021-01-15","2021-02-15","2021-03-15","2021-04-15","2021-05-15","2021-06-15","2021-07-15","2021-08-15","2021-09-15","2021-10-15","2021-11-15","2021-12-15","2022-01-15","2022-02-15","2022-03-15","2022-04-15","2022-05-15"]),
      	'ohc_kg': this.constructDateOptions(["2005-01-15","2005-02-15","2005-03-15","2005-04-15","2005-05-15","2005-06-15","2005-07-15","2005-08-15","2005-09-15","2005-10-15","2005-11-15","2005-12-15","2006-01-15","2006-02-15","2006-03-15","2006-04-15","2006-05-15","2006-06-15","2006-07-15","2006-08-15","2006-09-15","2006-10-15","2006-11-15","2006-12-15","2007-01-15","2007-02-15","2007-03-15","2007-04-15","2007-05-15","2007-06-15","2007-07-15","2007-08-15","2007-09-15","2007-10-15","2007-11-15","2007-12-15","2008-01-15","2008-02-15","2008-03-15","2008-04-15","2008-05-15","2008-06-15","2008-07-15","2008-08-15","2008-09-15","2008-10-15","2008-11-15","2008-12-15","2009-01-15","2009-02-15","2009-03-15","2009-04-15","2009-05-15","2009-06-15","2009-07-15","2009-08-15","2009-09-15","2009-10-15","2009-11-15","2009-12-15","2010-01-15","2010-02-15","2010-03-15","2010-04-15","2010-05-15","2010-06-15","2010-07-15","2010-08-15","2010-09-15","2010-10-15","2010-11-15","2010-12-15","2011-01-15","2011-02-15","2011-03-15","2011-04-15","2011-05-15","2011-06-15","2011-07-15","2011-08-15","2011-09-15","2011-10-15","2011-11-15","2011-12-15","2012-01-15","2012-02-15","2012-03-15","2012-04-15","2012-05-15","2012-06-15","2012-07-15","2012-08-15","2012-09-15","2012-10-15","2012-11-15","2012-12-15","2013-01-15","2013-02-15","2013-03-15","2013-04-15","2013-05-15","2013-06-15","2013-07-15","2013-08-15","2013-09-15","2013-10-15","2013-11-15","2013-12-15","2014-01-15","2014-02-15","2014-03-15","2014-04-15","2014-05-15","2014-06-15","2014-07-15","2014-08-15","2014-09-15","2014-10-15","2014-11-15","2014-12-15","2015-01-15","2015-02-15","2015-03-15","2015-04-15","2015-05-15","2015-06-15","2015-07-15","2015-08-15","2015-09-15","2015-10-15","2015-11-15","2015-12-15","2016-01-15","2016-02-15","2016-03-15","2016-04-15","2016-05-15","2016-06-15","2016-07-15","2016-08-15","2016-09-15","2016-10-15","2016-11-15","2016-12-15","2017-01-15","2017-02-15","2017-03-15","2017-04-15","2017-05-15","2017-06-15","2017-07-15","2017-08-15","2017-09-15","2017-10-15","2017-11-15","2017-12-15","2018-01-15","2018-02-15","2018-03-15","2018-04-15","2018-05-15","2018-06-15","2018-07-15","2018-08-15","2018-09-15","2018-10-15","2018-11-15","2018-12-15","2019-01-15","2019-02-15","2019-03-15","2019-04-15","2019-05-15","2019-06-15","2019-07-15","2019-08-15","2019-09-15","2019-10-15","2019-11-15","2019-12-15","2020-01-15","2020-02-15","2020-03-15","2020-04-15","2020-05-15","2020-06-15","2020-07-15","2020-08-15","2020-09-15","2020-10-15","2020-11-15","2020-12-15"])
      }
      this.fgRef = React.createRef()
      this.gridControls = {
      	'temperature_rg': React.createRef(),
      	'salinity_rg': React.createRef(),
      	'ohc_kg': React.createRef()
      }
      this.apiPrefix = 'https://argovis-api.colorado.edu/'
      this.scale = chroma.scale(['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825']); //chroma -> colorbrewer -> viridis
      this.refreshData()
    }

    constructLevelOptions(levels){
    	return levels.map((x,i) => {return(
    			<option key={x+i} value={i}>{x}</option>
    		)})
    }

    constructDateOptions(dates){
    	return dates.map((x,i) => {return(
    			<option key={x+i} value={x}>{x}</option>
    		)})
    }

    refreshData(){
    	//kick off request for new data, redraw the map when complete
    	console.log('refresh data', this.state.selectedGrid)
    	let url = this.apiPrefix + 'grids/' + this.state.selectedGrid+'?data=all&compression=array&startDate='+this.state.timestep[this.state.selectedGrid]+'T00:00:00Z&endDate='+this.state.timestep[this.state.selectedGrid]+'T00:00:01Z'
    	if(this.state.polygon.length > 0){
    		url += '&polygon='+JSON.stringify(this.state.polygon)
    	}
			fetch(url)
				.then(response => {response.json().then(data => {
					this.setState({...this.state, status:'rendering'}, () => {this.refreshMap(data)})					
				})})
    }

    refreshMap(data){
    	// redraw the map and render the dom
    	console.log(data)
    	console.log(this.state.status)
    	console.log(this.state.levelindex)
    	if(data.length > 0){
				let values = data.map(x=>x.data[this.state.levelindex[this.state.selectedGrid]][0]).filter(x=>x!==null)
				this.setState({...this.state, grid: this.gridRasterfy(data, Math.min(...values), Math.max(...values)), raw: data, status: 'ready'})
	    }
    }

    changeGrid(target){
    	if(this.state.selectedGrid){
	    	this.gridControls[this.state.selectedGrid].current.classList.toggle('hidden')
	    }
    	this.gridControls[target.target.id].current.classList.toggle('hidden')
    	this.setState({...this.state, selectedGrid: target.target.id, status: 'downloading'}, () => this.refreshData())
    }

    changeLevel(target, grid){
    	let s = this.state
    	s.levelindex[grid] = parseInt(target.target.value)
    	s.status = 'rendering'
    	this.setState(s, () => this.refreshMap(this.state.raw))
    }

    changeDate(target, grid){
    	console.log('>>>>', target.target.value)
    	let s = this.state
    	s.timestep[grid] = target.target.value
    	s.status = 'downloading'
    	this.setState(s, () => this.refreshData())
    }

    gridRasterfy(points, min, max){
    	// expects a list from a data endpoint with compression=array
			if(points.hasOwnProperty('code') || points[0].hasOwnProperty('code')){
				return null
			}
			else {
				points = points.map(point => {return(
					<Rectangle key={point._id+Math.random()} bounds={[[point.geolocation.coordinates[1]-0.5, point.geolocation.coordinates[0]-0.5],[point.geolocation.coordinates[1]+0.5, point.geolocation.coordinates[0]+0.5]]} pathOptions={{ fillOpacity: 0.5, weight: 0, color: this.chooseColor(point.data[this.state.levelindex[this.state.selectedGrid]][0], min, max) }}>
      				<Tooltip>
				      	ID: {point._id} <br />
				  			Long / Lat: {point.geolocation.coordinates[0]} / {point.geolocation.coordinates[1]} <br />
				  			Date: {point.timestamp}
				  		</Tooltip>
    			</Rectangle>
				)})
				return points
			}
    }

    chooseColor(val, min, max){
    	if(val === null){
    		return 'black'
    	}

    	return this.scale((val-min)/(max - min)).hex()
    }

    generateStatus(status){
    	// status == 'ready', 'downloading', 'rendering'
    	let message = ''
  		let className = ''
    	if(status === 'ready'){
    		className = 'statusBanner ready'
    		message = 'Ready'
    	} else if(status === 'downloading'){
    		className = 'statusBanner busy'
    		message = 'Downloading...'
    	} else if(status === 'rendering'){
    		className = 'statusBanner busy'
    		message = 'Rendering...'
    	}
    	return(
	    	<span className={className}>{message}</span>
	    	)
    }

    fetchPolygon(coords){
    	// coords == array of {lng: xx, lat: xx}, such as returned by getLatLngs
    	let vertexes = coords.map(x => [x.lng, x.lat])
    	vertexes.push(vertexes[0])
    	// eslint-disable-next-line 
    	this.state.polygon = vertexes 	
    	this.refreshData()
    }

    onPolyCreate(payload){
    	this.fetchPolygon(payload.layer.getLatLngs()[0])
    }

    onPolyDelete(payload){
    	// eslint-disable-next-line
    	this.state.polygon = []
    	this.refreshData()
    }

    onPolyEdit(payload){
    	payload.layers.eachLayer(layer => this.fetchPolygon(layer.getLatLngs()[0]))
    }

    onDrawStop(payload){
    	// if there's already a polygon, get rid of it.
    	if(Object.keys(this.fgRef.current._layers).length > 1){
    		let layerID = Object.keys(this.fgRef.current._layers)[0]
    		let layer = this.fgRef.current._layers[layerID]
    		this.fgRef.current.removeLayer(layer)
    	}
    }

	render(){
		console.log('render ahoy')

		return(
			<div>
				<div className='row'>
					
					{/*search option sidebar*/}
					<div className='col-3 overflow-auto'>
						{this.generateStatus(this.state.status)}
						<div className='mapSearchInputs'>
							<h5>Search Control</h5>
							<div className="form-check">
							  <input className="form-check-input" type="radio" name="flexRadioDefault" id="temperature_rg" onChange={(v) => this.changeGrid(v)} checked={this.state.selectedGrid === 'temperature_rg'}/>
							  <label className="form-check-label" htmlFor="temperature_rg">
							    Roemmich-Gilson temperature total
							  </label>
							</div>
							<div ref={this.gridControls['temperature_rg']}>
								<div className='row'>
									<div className='col-1'></div>
									<div className='col-11'>
										<select className="form-select" onChange={(v) => this.changeLevel(v, 'temperature_rg')}>
											{this.levels.temperature_rg}
										</select>
										<small className="form-text text-muted">Depth Layer [m]</small>
									</div>
								</div>
								<div className='row'>
									<div className='col-1'></div>
									<div className='col-11'>
										<select className="form-select" onChange={(v) => this.changeDate(v, 'temperature_rg')}>
											{this.timesteps.temperature_rg}
										</select>
										<small className="form-text text-muted">Month</small>
									</div>
								</div>
							</div>
							<div className="form-check">
							  <input className="form-check-input" type="radio" name="flexRadioDefault" id="salinity_rg" onChange={(v) => this.changeGrid(v)} checked={this.state.selectedGrid === 'salinity_rg'}/>
							  <label className="form-check-label" htmlFor="salinity_rg">
							    Roemmich-Gilson salinity total
							  </label>
							</div>
							<div ref={this.gridControls['salinity_rg']} className='hidden'>
								<div className='row'>
									<div className='col-1'></div>
									<div className='col-11'>
										<select className="form-select" onChange={(v) => this.changeLevel(v, 'salinity_rg')}>
											{this.levels.salinity_rg}
										</select>
										<small className="form-text text-muted">Depth Layer [m]</small>
									</div>
								</div>
								<div className='row'>
									<div className='col-1'></div>
									<div className='col-11'>
										<select className="form-select" onChange={(v) => this.changeDate(v, 'salinity_rg')}>
											{this.timesteps.salinity_rg}
										</select>
										<small className="form-text text-muted">Month</small>
									</div>
								</div>
							</div>
							<div className="form-check">
							  <input className="form-check-input" type="radio" name="flexRadioDefault" id="ohc_kg" onChange={(v) => this.changeGrid(v)} checked={this.state.selectedGrid === 'ohc_kg'}/>
							  <label className="form-check-label" htmlFor="ohc_kg">
							    Kuusela-Giglio ocean heat content
							  </label>
							</div>
							<div ref={this.gridControls['ohc_kg']} className='hidden'>
								<div className='row'>
									<div className='col-1'></div>
										<div className='col-11'>
											<select className="form-select" onChange={(v) => this.changeLevel(v, 'ohc_kg')}>
												{this.levels.ohc_kg}
											</select>
											<small className="form-text text-muted">Depth Layer [m]</small>
										</div>
								</div>
								<div className='row'>
									<div className='col-1'></div>
									<div className='col-11'>
										<select className="form-select" onChange={(v) => this.changeDate(v, 'ohc_kg')}>
											{this.timesteps.ohc_kg}
										</select>
										<small className="form-text text-muted">Month</small>
									</div>
								</div>
							</div>
						</div>
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
						      onEdited={p => this.onPolyEdit.bind(this,p)()}
						      onCreated={p => this.onPolyCreate.bind(this,p)()}
						      onDeleted={p => this.onPolyDelete.bind(this,p)()}
						      onDrawStop={p => this.onDrawStop.bind(this,p)()}
						      draw={{
                    rectangle: false,
                    circle: false,
                    polyline: false,
                    circlemarker: false,
                    marker: false,
                    polygon: {
                    	shapeOptions: {
                    		color: "black",
                    		fillOpacity: 0
                    	}
                    }
						      }}
						    />
						    <Polygon positions={this.state.polygon.map(x => [x[1],x[0]])} color={"black"} fillOpacity={0}></Polygon>
						  </FeatureGroup>
              {this.state.grid}
						</MapContainer>
					</div>
				</div>
			</div>
		)
	}
}

export default Grids