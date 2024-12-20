import React from 'react';
import { MapContainer, TileLayer, Popup, Polygon, FeatureGroup, Rectangle} from 'react-leaflet'
import { EditControl } from "react-leaflet-draw";
import '../index.css';
import chroma from "chroma-js";
import helpers from'./helpers'
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

class Grids extends React.Component {
    constructor(props) {
      super(props);

	  // someday: get this from the database
	  this.glodapDataInfo = [
		[
			"Cant",
			"Cant_error",
			"Cant_Input_mean",
			"Cant_Input_std",
			"Cant_Input_N",
			"Cant_relerr",
			"NO3",
			"NO3_error",
			"NO3_Input_mean",
			"NO3_Input_std",
			"NO3_Input_N",
			"NO3_relerr",
			"OmegaA",
			"OmegaA_error",
			"OmegaA_Input_mean",
			"OmegaA_Input_std",
			"OmegaA_Input_N",
			"OmegaA_relerr",
			"OmegaC",
			"OmegaC_error",
			"OmegaC_Input_mean",
			"OmegaC_Input_std",
			"OmegaC_Input_N",
			"OmegaC_relerr",
			"oxygen",
			"oxygen_error",
			"oxygen_Input_mean",
			"oxygen_Input_std",
			"oxygen_Input_N",
			"oxygen_relerr",
			"pHts25p0",
			"pHts25p0_error",
			"pHts25p0_Input_mean",
			"pHts25p0_Input_std",
			"pHts25p0_Input_N",
			"pHts25p0_relerr",
			"pHtsinsitutp",
			"pHtsinsitutp_error",
			"pHtsinsitutp_Input_mean",
			"pHtsinsitutp_Input_std",
			"pHtsinsitutp_Input_N",
			"pHtsinsitutp_relerr",
			"PI_TCO2",
			"PI_TCO2_error",
			"PI_TCO2_Input_mean",
			"PI_TCO2_Input_std",
			"PI_TCO2_Input_N",
			"PI_TCO2_relerr",
			"PO4",
			"PO4_error",
			"PO4_Input_mean",
			"PO4_Input_std",
			"PO4_Input_N",
			"PO4_relerr",
			"salinity",
			"salinity_error",
			"salinity_Input_mean",
			"salinity_Input_std",
			"salinity_Input_N",
			"salinity_relerr",
			"silicate",
			"silicate_error",
			"silicate_Input_mean",
			"silicate_Input_std",
			"silicate_Input_N",
			"silicate_relerr",
			"TAlk",
			"TAlk_error",
			"TAlk_Input_mean",
			"TAlk_Input_std",
			"TAlk_Input_N",
			"TAlk_relerr",
			"TCO2",
			"TCO2_error",
			"TCO2_Input_mean",
			"TCO2_Input_std",
			"TCO2_Input_N",
			"TCO2_relerr",
			"temperature",
			"temperature_error",
			"temperature_Input_mean",
			"temperature_Input_std",
			"temperature_Input_N",
			"temperature_relerr"
		],
		[
			"units",
			"long_name"
		],
		[
			[
				"micro-mol kg-1",
				"moles of anthropogenic carbon content per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"anthropogenic carbon content error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"moles of nitrate per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"nitrate error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"",
				"aragonite saturation state calculated at in situ temperature and pressure"
			],
			[
				"",
				"OmegaAr error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"",
				"calcite saturation state calculated at in situ temperature and pressure"
			],
			[
				"",
				"OmegaCa error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"moles of dissolved molecular oxygen per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"dissolved molecular oxygen error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"",
				"seawater ph reported on total scale at standard temperature (25C) and pressure (0dbar)"
			],
			[
				"",
				"pH error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"",
				"seawater ph reported on total scale at in situ temperature and pressure"
			],
			[
				"",
				"pH error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"moles of pre-industrial dissolved inorganic carbon per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"pre-industrial dissolved inorganic carbon error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"moles of phosphate per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"phosphate error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"",
				"seawater practical salinity"
			],
			[
				"",
				"practical salinity error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"moles of silicate per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"silicate error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"seawater alkalinity expressed as mole equivalent per unit mass"
			],
			[
				"micro-mol kg-1",
				"total alkalinity error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"micro-mol kg-1",
				"moles of dissolved inorganic carbon per unit mass in seawater"
			],
			[
				"micro-mol kg-1",
				"dissolved inorganic carbon error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			],
			[
				"degrees celcius",
				"seawater temperature"
			],
			[
				"degrees celcius",
				"temperature error"
			],
			[
				"micro-mol kg-1",
				"bin averaged input data"
			],
			[
				"micro-mol kg-1",
				"standard deviation of bin averaged input data"
			],
			[
				"",
				"number of data in bins"
			],
			[
				"",
				"relative error"
			]
		]
	]

      this.defaultPolygon = [[-52.382812,53.225768],[-62.050781,48.107431],[-72.773438,43.325178],[-77.695313,37.996163],[-81.5625,32.990236],[-82.089844,27.683528],[-78.925781,22.755921],[-71.547389,23.008026],[-64.160156,22.917923],[-57.673458,28.712256],[-50.449219,34.161818],[-40.078125,44.590467],[-35.683594,51.618017],[-43.066406,54.265224],[-52.382812,53.225768]]
      let q = new URLSearchParams(window.location.search) // parse out query string
      document.title = 'Argovis - Explore ' + q.get('lattice') + ' grid'
      this.state = {
		gridcells: [],
      	points: [],
      	subpoints: [],
      	polygon: q.has('polygon') ? JSON.parse(q.get('polygon')) : this.defaultPolygon,
      	interpolated_polygon: q.has('polygon') ? helpers.insertPointsInPolygon(JSON.parse(q.get('polygon'))) : helpers.insertPointsInPolygon(this.defaultPolygon),
      	min: 0,
      	max: 1,
		display_min: 0,
		display_max: 1,
		user_defined_min: false,
		user_defined_max: false,
      	levelindex: q.has('levelindex') ? q.get('levelindex') : 0,
      	sublevelindex: q.has('sublevelindex') ? q.get('sublevelindex') : 0,
      	grid	: q.get('grid'),
      	lattice: q.get('lattice'),
      	refreshData: true,
		remapData: false,
      	apiKey: localStorage.getItem('apiKey') ? localStorage.getItem('apiKey') : 'guest',
      	subgrid: q.has('subgrid') ? q.get('subgrid') === 'true' : false,
      	scale: chroma.scale(['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825']),
      	centerlon: -70,
        data: [[]], // raw download data
        phase: 'refreshData', // refreshData, remapData, awaitingUserInput, or idle
        suppressBlur: false,
      }

	  this.state.timestep = q.has('timestep') ? q.get('timestep') : {
		'rg09': "2004-01-15",
		'kg21': "2005-01-15",
	  	'glodap': "1000-01-01"
	  }[this.state.lattice]
      this.state.subtimestep = q.has('subtimestep') ? q.get('subtimestep') : this.state.timestep
      this.state.units = this.chooseUnits(this.state.grid)
      this.state.levelunits = {
      	'rg09': 'dbar',
      	'kg21': 'integral, 15-300 dbar',
		'glodap': 'm'
      }[this.state.lattice]
      this.rawLevels = {
      	'rg09': [2.5,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,182.5,200,220,240,260,280,300,320,340,360,380,400,420,440,462.5,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1412.5,1500,1600,1700,1800,1900,1975],
      	'kg21': [15],
		'glodap': [0,10,20,30,50,75,100,125,150,200,250,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1750,2000,2500,3000,3500,4000,4500,5000,5500]
      }[this.state.lattice]
      this.levels = this.constructLevelOptions(this.rawLevels)
      this.timesteps = {
      	'rg09': this.constructDateOptions(["2004-01-15","2004-02-15","2004-03-15","2004-04-15","2004-05-15","2004-06-15","2004-07-15","2004-08-15","2004-09-15","2004-10-15","2004-11-15","2004-12-15","2005-01-15","2005-02-15","2005-03-15","2005-04-15","2005-05-15","2005-06-15","2005-07-15","2005-08-15","2005-09-15","2005-10-15","2005-11-15","2005-12-15","2006-01-15","2006-02-15","2006-03-15","2006-04-15","2006-05-15","2006-06-15","2006-07-15","2006-08-15","2006-09-15","2006-10-15","2006-11-15","2006-12-15","2007-01-15","2007-02-15","2007-03-15","2007-04-15","2007-05-15","2007-06-15","2007-07-15","2007-08-15","2007-09-15","2007-10-15","2007-11-15","2007-12-15","2008-01-15","2008-02-15","2008-03-15","2008-04-15","2008-05-15","2008-06-15","2008-07-15","2008-08-15","2008-09-15","2008-10-15","2008-11-15","2008-12-15","2009-01-15","2009-02-15","2009-03-15","2009-04-15","2009-05-15","2009-06-15","2009-07-15","2009-08-15","2009-09-15","2009-10-15","2009-11-15","2009-12-15","2010-01-15","2010-02-15","2010-03-15","2010-04-15","2010-05-15","2010-06-15","2010-07-15","2010-08-15","2010-09-15","2010-10-15","2010-11-15","2010-12-15","2011-01-15","2011-02-15","2011-03-15","2011-04-15","2011-05-15","2011-06-15","2011-07-15","2011-08-15","2011-09-15","2011-10-15","2011-11-15","2011-12-15","2012-01-15","2012-02-15","2012-03-15","2012-04-15","2012-05-15","2012-06-15","2012-07-15","2012-08-15","2012-09-15","2012-10-15","2012-11-15","2012-12-15","2013-01-15","2013-02-15","2013-03-15","2013-04-15","2013-05-15","2013-06-15","2013-07-15","2013-08-15","2013-09-15","2013-10-15","2013-11-15","2013-12-15","2014-01-15","2014-02-15","2014-03-15","2014-04-15","2014-05-15","2014-06-15","2014-07-15","2014-08-15","2014-09-15","2014-10-15","2014-11-15","2014-12-15","2015-01-15","2015-02-15","2015-03-15","2015-04-15","2015-05-15","2015-06-15","2015-07-15","2015-08-15","2015-09-15","2015-10-15","2015-11-15","2015-12-15","2016-01-15","2016-02-15","2016-03-15","2016-04-15","2016-05-15","2016-06-15","2016-07-15","2016-08-15","2016-09-15","2016-10-15","2016-11-15","2016-12-15","2017-01-15","2017-02-15","2017-03-15","2017-04-15","2017-05-15","2017-06-15","2017-07-15","2017-08-15","2017-09-15","2017-10-15","2017-11-15","2017-12-15","2018-01-15","2018-02-15","2018-03-15","2018-04-15","2018-05-15","2018-06-15","2018-07-15","2018-08-15","2018-09-15","2018-10-15","2018-11-15","2018-12-15","2019-01-15","2019-02-15","2019-03-15","2019-04-15","2019-05-15","2019-06-15","2019-07-15","2019-08-15","2019-09-15","2019-10-15","2019-11-15","2019-12-15","2020-01-15","2020-02-15","2020-03-15","2020-04-15","2020-05-15","2020-06-15","2020-07-15","2020-08-15","2020-09-15","2020-10-15","2020-11-15","2020-12-15","2021-01-15","2021-02-15","2021-03-15","2021-04-15","2021-05-15","2021-06-15","2021-07-15","2021-08-15","2021-09-15","2021-10-15","2021-11-15","2021-12-15","2022-01-15","2022-02-15","2022-03-15","2022-04-15","2022-05-15","2022-06-15","2022-07-15","2022-08-15","2022-09-15","2022-10-15","2022-11-15","2022-12-15","2023-01-15","2023-02-15","2023-03-15","2023-04-15","2023-05-15","2023-06-15","2023-07-15","2023-08-15","2023-09-15","2023-10-15","2023-11-15","2023-12-15","2024-01-15","2024-02-15","2024-03-15","2024-04-15","2024-05-15","2024-06-15","2024-07-15","2024-08-15","2024-09-15","2024-10-15"]),
      	'kg21': this.constructDateOptions(["2005-01-15","2005-02-15","2005-03-15","2005-04-15","2005-05-15","2005-06-15","2005-07-15","2005-08-15","2005-09-15","2005-10-15","2005-11-15","2005-12-15","2006-01-15","2006-02-15","2006-03-15","2006-04-15","2006-05-15","2006-06-15","2006-07-15","2006-08-15","2006-09-15","2006-10-15","2006-11-15","2006-12-15","2007-01-15","2007-02-15","2007-03-15","2007-04-15","2007-05-15","2007-06-15","2007-07-15","2007-08-15","2007-09-15","2007-10-15","2007-11-15","2007-12-15","2008-01-15","2008-02-15","2008-03-15","2008-04-15","2008-05-15","2008-06-15","2008-07-15","2008-08-15","2008-09-15","2008-10-15","2008-11-15","2008-12-15","2009-01-15","2009-02-15","2009-03-15","2009-04-15","2009-05-15","2009-06-15","2009-07-15","2009-08-15","2009-09-15","2009-10-15","2009-11-15","2009-12-15","2010-01-15","2010-02-15","2010-03-15","2010-04-15","2010-05-15","2010-06-15","2010-07-15","2010-08-15","2010-09-15","2010-10-15","2010-11-15","2010-12-15","2011-01-15","2011-02-15","2011-03-15","2011-04-15","2011-05-15","2011-06-15","2011-07-15","2011-08-15","2011-09-15","2011-10-15","2011-11-15","2011-12-15","2012-01-15","2012-02-15","2012-03-15","2012-04-15","2012-05-15","2012-06-15","2012-07-15","2012-08-15","2012-09-15","2012-10-15","2012-11-15","2012-12-15","2013-01-15","2013-02-15","2013-03-15","2013-04-15","2013-05-15","2013-06-15","2013-07-15","2013-08-15","2013-09-15","2013-10-15","2013-11-15","2013-12-15","2014-01-15","2014-02-15","2014-03-15","2014-04-15","2014-05-15","2014-06-15","2014-07-15","2014-08-15","2014-09-15","2014-10-15","2014-11-15","2014-12-15","2015-01-15","2015-02-15","2015-03-15","2015-04-15","2015-05-15","2015-06-15","2015-07-15","2015-08-15","2015-09-15","2015-10-15","2015-11-15","2015-12-15","2016-01-15","2016-02-15","2016-03-15","2016-04-15","2016-05-15","2016-06-15","2016-07-15","2016-08-15","2016-09-15","2016-10-15","2016-11-15","2016-12-15","2017-01-15","2017-02-15","2017-03-15","2017-04-15","2017-05-15","2017-06-15","2017-07-15","2017-08-15","2017-09-15","2017-10-15","2017-11-15","2017-12-15","2018-01-15","2018-02-15","2018-03-15","2018-04-15","2018-05-15","2018-06-15","2018-07-15","2018-08-15","2018-09-15","2018-10-15","2018-11-15","2018-12-15","2019-01-15","2019-02-15","2019-03-15","2019-04-15","2019-05-15","2019-06-15","2019-07-15","2019-08-15","2019-09-15","2019-10-15","2019-11-15","2019-12-15","2020-01-15","2020-02-15","2020-03-15","2020-04-15","2020-05-15","2020-06-15","2020-07-15","2020-08-15","2020-09-15","2020-10-15","2020-11-15","2020-12-15"]),
		'glodap': this.constructDateOptions(["1000-01-01"])
      }[this.state.lattice]
      this.reflink = {
      	'rg09': 'https://sio-argo.ucsd.edu/RG_Climatology.html',
      	'kg21': 'https://zenodo.org/record/6131625#.Y3P5FILMKWA',
		'glodap': 'TBD'
      }[this.state.lattice]
      this.state.title = this.chooseTitle(this.state.grid)
	  this.variables = {
		'rg09': this.constructVarOptions(['rg09_temperature', 'rg09_salinity'], x=>x), // not used... yet.
		'kg21': this.constructVarOptions(['kg21_ohc15to300'], x=>x), // not used... yet.
		'glodap': this.constructVarOptions(this.glodapDataInfo[0], this.glodapHumanName)
	  }[this.state.lattice]

      this.fgRef = React.createRef()
      this.statusReporting = React.createRef()
      this.formRef = React.createRef()
      this.scales = {
      	'rg09': '',
      	'kg21': 'G',
		'glodap': ''
      }[this.state.lattice]
      this.apiPrefix = 'https://argovis-api.colorado.edu/'
      this.customQueryParams = ['polygon', 'grid', 'levelindex', 'sublevelindex', 'timestep', 'subtimestep', 'subgrid']
      this.vocab = {}
    
      this.state.urls = this.generateURLs(this.state)
      this.downloadData()
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
        let s = {...this.state} 

        if(this.state.subgrid && this.state.data.length === 2){
            // munge state.data[0] and state.data[1] into profile-like objects where the data value is the delta

            /// start by turning grids into kv keyed by unique concatenation of lon/lat so we can easily subtract the correct pairs of points
            let grid1 = {}
            for(let i=0; i<s.data[0].length; i++){
                grid1['' + s.data[0][i].geolocation.coordinates[0] + s.data[0][i].geolocation.coordinates[1]] = {
                    geolocation: s.data[0][i].geolocation,
                    data: s.data[0][i].data
                }
            }
            let grid2 = {}
            for(let i=0; i<s.data[1].length; i++){
                grid2['' + s.data[1][i].geolocation.coordinates[0] + s.data[1][i].geolocation.coordinates[1]] = {
                    geolocation: s.data[1][i].geolocation,
                    data: s.data[1][i].data
                }
            }
            /// subrtract grids, produce a list of objects that is 'profile-like' where data are the delta values
            s.data = [[]]
            for(let i=0; i<Object.keys(grid1).length; i++){
                let key = Object.keys(grid1)[i]
                if(Object.keys(grid2).includes(key)){
                    s.data[0].push({
                        geolocation: grid1[key].geolocation,
                        data: [[grid1[key].data[0][0] - grid2[key].data[0][0]]]
                    })
                }
            }

        } 

        // determining colorscale min and max
        let values = s.data[0].map(x=>x.data[0][0]).filter(x=>x!==null)
        if(!s.user_defined_min){
            s.display_min = this.unitTransform(Math.min(...values), this.scales)
        }
        if(!s.user_defined_max){
            s.display_max = this.unitTransform(Math.max(...values), this.scales)
        }
        let min = this.state.user_defined_min ? this.inverseTransform(s.display_min, this.scales) : Math.min(...values)
        let max = this.state.user_defined_max ? this.inverseTransform(s.display_max, this.scales) : Math.max(...values)
        s = this.setScale(min, max, s)

        this.setState({
                ...s, 
                gridcells: this.gridRasterfy(s), 
                min: this.state.user_defined_min ? this.state.min : min, 
                max: this.state.user_defined_max ? this.state.max : max, 
                phase: 'idle',
                suppressBlur: false
            }
        )
    }

    generateURLs(params){
        let lattice = params.hasOwnProperty('lattice') ? params.lattice : this.state.lattice
        let grid = params.hasOwnProperty('grid') ? params.grid : this.state.grid
        let timestep = params.hasOwnProperty('timestep') ? params.timestep : this.state.timestep
        let levelindex = params.hasOwnProperty('levelindex') ? params.levelindex : this.state.levelindex
        let subtimestep = params.hasOwnProperty('subtimestep') ? params.subtimestep : this.state.subtimestep
        let sublevelindex = params.hasOwnProperty('sublevelindex') ? params.sublevelindex : this.state.sublevelindex
        let polygon = params.hasOwnProperty('polygon') ? params.polygon : this.state.polygon
        let subgrid = params.hasOwnProperty('subgrid') ? params.subgrid : this.state

        let urls = []

        let url    = this.apiPrefix + 'grids/' + lattice+'?data='+grid+'&startDate='+timestep+'T00:00:00Z&endDate='+timestep+'T00:00:01Z&verticalRange='+(this.rawLevels[levelindex]-0.1)+','+(this.rawLevels[levelindex]+0.1)
        let suburl = this.apiPrefix + 'grids/' + lattice+'?data='+grid+'&startDate='+subtimestep+'T00:00:00Z&endDate='+subtimestep+'T00:00:01Z&verticalRange='+(this.rawLevels[sublevelindex]-0.1)+','+(this.rawLevels[sublevelindex]+0.1)
        if(polygon.length > 0){
            url += '&polygon='+JSON.stringify(helpers.tidypoly(polygon))
            suburl += '&polygon='+JSON.stringify(helpers.tidypoly(polygon))
        }

        urls.push(url)
        if(subgrid){
            urls.push(suburl)
        }

        return urls
    }

	chooseTitle(grid){
		if(grid === 'rg09_temperature'){
			return 'RG Temperature'
		} else if(grid === 'rg09_salinity'){
			return 'RG Salinity'
		} else if(grid === 'kg21_ohc15to300'){
			return 'KG Ocean Heat Content'
		} else {
			return 'GLODAP ' + this.glodapHumanName(grid)
		}
	}

	chooseUnits(grid){
		if(grid === 'rg09_temperature'){
			return 'degree celcius (ITS-90)'
		} else if(grid === 'rg09_salinity'){
			return 'psu'
		} else if(grid === 'kg21_ohc15to300'){
			return 'J/m^2'
		} else {
			let i = this.glodapDataInfo[0].indexOf(grid)
			return this.glodapDataInfo[2][i][0]
		}
	}

	glodapHumanName(name){
		let tokens = name.split('_')
		let out = ''

		let basenames = {
			'Cant': 'Anthropogenic Carbon',
			'NO3': 'Nitrate',
			'OmegaA': 'Aragonite saturation state',
			'OmegaC': 'Calcite saturation state',
			'oxygen': 'Dissolved oxygen',
			'pHts25p0': 'pH (STP)',
			'pHtsinsitutp': 'pH (in situ)',
			'PI': 'Pre-industrial dissolved inorganic carbon',
			'PO4': 'Phosphate',
			'salinity': 'Salinity',
			"silicate": 'Silicate',
			'TAlk': 'Alkalinity',
			'TCO2': 'Dissolved inorganic carbon',
			'temperature': 'Temperature'
		}

		out += basenames[tokens[0]]
		let i = 1
		if (tokens[i] === 'TCO2'){
			i++
		}
		if(tokens[i] === 'error'){
			out += ' error'
		} else if(tokens[i] === 'Input'){
			if(tokens[i+1] === 'mean'){
				out += ' bin av.'
			} else if(tokens[i+1] === 'std'){
				out += ' std. dev. of bin av.'
			} else if(tokens[i+1] === 'N'){
				out += ' N'
			}
		} else if(tokens[i] === 'relerr'){
			out += ' relative error'
		}

		return out
	}

    // input handlers
    changeLevel(target, index){
    	let s = {...this.state}

    	s[index] = parseInt(target.target.value)
        let levelindex = index === 'levelindex' ? target.target.value : null
        let sublevelindex = index === 'sublevelindex' ? target.target.value : null
    	s.phase = 'refreshData'
		s.user_defined_min = false
		s.user_defined_max = false

        let params = {}
        if(levelindex !== null){
            params.levelindex = parseInt(levelindex)
        }
        if(sublevelindex !== null){
            params.sublevelindex = parseInt(sublevelindex)
        }
        s.urls = this.generateURLs(params)

        this.setState(s)
    }

    changeDate(target, index){
    	let s = {...this.state}

    	s[index] = target.target.value
        let timestep = index === 'timestep' ? target.target.value : null
        let subtimestep = index === 'subtimestep' ? target.target.value : null
    	s.phase = 'refreshData'
		s.user_defined_min = false
		s.user_defined_max = false
        let params = {
            timestep: timestep,
            subtimestep: subtimestep
        }
        s.urls = this.generateURLs(params)
    	
        this.setState(s)
    }

    changeVariable(target){
    	let s = {...this.state}

    	s.grid = target.target.value
		s.title = this.chooseTitle(target.target.value)
    	s.phase = 'refreshData'
		s.user_defined_min = false
		s.user_defined_max = false
        s.urls = this.generateURLs({grid: target.target.value})
    	
        this.setState(s)
    }

    changeRange(e, index){
        let s = {...this.state}

        s.phase = 'awaitingUserInput'
        s[index] = e.target.value
        
        this.setState(s)
    }

    toggleSubgrid(e){
    	let s = {...this.state}
        
        s.urls = this.generateURLs({subgrid: !s.subgrid})
        s.subgrid = !s.subgrid
        s.phase = 'refreshData'
		s.user_defined_min = false
		s.user_defined_max = false

        this.setState(s)
    }

    // mungers
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

    constructVarOptions(values, namemapper){
    	return values.map((x,i) => {return(
    			<option key={x+i} value={x}>{namemapper(x)}</option>
    		)})
    }

    gridRasterfy(state){

    	// expects a list from a data endpoint
        if(state.data.hasOwnProperty('code') || state.data[0].hasOwnProperty('code')){
            return null
        }
        else {
            let points = state.data[0].map(point => {return(
                <Rectangle 
                    key={Math.random()} 
                    bounds={[[point.geolocation.coordinates[1]-0.5, helpers.mutateLongitude(point.geolocation.coordinates[0], parseFloat(state.centerlon))-0.5],[point.geolocation.coordinates[1]+0.5, helpers.mutateLongitude(point.geolocation.coordinates[0], parseFloat(state.centerlon))+0.5]]} 
                    pathOptions={{ 
                        fillOpacity: 0.5, 
                        weight: 0, 
                        color: this.chooseColor(point.data[0][0], state) 
                    }}>
                    {this.genTooltip(point)}
                </Rectangle>
            )})
            return points
        }
    }

    chooseColor(val, state){
    	if(val === null){
    		return 'black'
    	}

    	return state.scale(val).hex()
    }

    fetchPolygon(coords){
    	helpers.fetchPolygon.bind(this)(coords)
    }

    dateRangeMultiplyer(s){
    	// allowed date range will be multiplied by this much, as a function of the mutated state s
    	return 1
    }

    unitTransform(unit, scale){
		if (unit === '' || unit === '-'){
			return unit
		}

    	if(scale === 'k'){
    		return Math.round(unit)/1000
    	} else if(scale === 'M'){
    		return Math.round(unit/1000)/1000
    	} else if(scale === 'G'){
    		return Math.round(unit/1000000)/1000
    	} else {
    		return Math.round(1000*unit)/1000
    	}
    }

	inverseTransform(unit, scale){
		if (unit === '' || unit === '-'){
			return unit
		}

		if(scale === 'k'){
			return 1000*unit
		} else if(scale === 'M'){
			return 1000000*unit
		} else if(scale === 'G'){
			return 1000000000*unit
		} else {
			return unit
		}
	}

    genTooltip(point){
    	// given an array <point> corresponding to a single point returned by an API data route with compression=minimal,
    	// return the jsx for an appropriate tooltip for this point.

		  if(this.state.subgrid){
		   	return(<Popup>
				  			Long / Lat: {helpers.mungePrecision(point.geolocation.coordinates[0])} / {helpers.mungePrecision(point.geolocation.coordinates[1])} <br />
				  			Value: {point.data[0][0]}
				  	  </Popup>)
		  } else {
	    	return(<Popup>
						      ID: {point._id} <br />
						      Long / Lat: {point.geolocation.coordinates[0]} / {point.geolocation.coordinates[1]} <br />
						      Date: {point.timestamp} <br />
						    </Popup>)
		  }
    }

    setScale(min, max, state){

    	if(state.subgrid){
    		if(min > 0){
    			state.scale = chroma.scale(['#FFFFFF', '#FF0000']).domain([0,max])
    			state.colormin = 0
    			state.colormax = max
    		} else if(max < 0){
    			state.scale = chroma.scale(['#0000FF', '#FFFFFF']).domain([min,0])
    			state.colormin = min
    			state.colormax = 0
    		} else {
    			state.scale = chroma.scale(['#0000FF', '#FFFFFF', '#FF0000']).domain([min,0,max])
    			state.colormin = min
    			state.colormax = max
    		}
    	} else {
    		state.scale = chroma.scale(['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825']).domain([min,max])
    		state.colormin = min
    		state.colormax = max
    	}

    	return state
   }

	render(){
		console.log(this.state)
		return(
			<>
				<div style={{'width':'100vw', 'textAlign': 'center', 'padding':'0.5em', 'fontStyle':'italic'}} className='d-lg-none'>Use the right-hand scroll bar to scroll down for search controls</div>
				<div className='row' style={{'width':'100vw'}}>	
					{/*search option sidebar*/}
					<div className='col-lg-3 order-last order-lg-first'>
						<fieldset disabled ref={this.formRef}>
							<span ref={this.statusReporting} className='statusBanner busy'>Downloading...</span>
							<div className='mapSearchInputs scrollit' style={{'height':'90vh'}}>
								<h5>
									<OverlayTrigger
										placement="right"
										overlay={
											<Tooltip id="compression-tooltip" className="wide-tooltip">
												Gridded products interpolate in-situ measurements or simulate data to regular grids. Narrow down your search using the form below, or specify a geographic region by first clicking on the pentagon button in the top left of the map, then choosing the vertexes of your region of interest. Click on regions that appear to see links to more information.
											</Tooltip>
										}
										trigger="click"
									>
										<i style={{'float':'right'}} className="fa fa-question-circle" aria-hidden="true"></i>
                                    </OverlayTrigger>
									{'Explore ' + this.state.title}		
								</h5>
								<small><a target="_blank" rel="noreferrer" href={this.reflink}>Original Data Reference</a></small>
								<div className="form-floating mb-3" style={{'marginTop': '0.5em'}}>
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
								<div>
									<div className='row'>
										<div className='col-12'>
											<small className="form-text text-muted">Depth Layer [{this.state.levelunits}]</small>
											<select className="form-select" value={this.state.levelindex} onChange={(v) => this.changeLevel(v, 'levelindex')}>
												{this.levels}
											</select>
										</div>
									</div>
									{this.state.lattice !== 'glodap' && 
									<div className='row'>
										<div className='col-12'>
											<small className="form-text text-muted">Month</small>
											<select className="form-select" value={this.state.timestep} onChange={(v) => this.changeDate(v, 'timestep')}>
												{this.timesteps}
											</select>
										</div>
									</div>}
									{this.state.lattice === 'glodap' && 
									<div className='row'>
										<div className='col-12'>
											<small className="form-text text-muted">Variable</small>
											<select className="form-select" value={this.state.grid} onChange={(v) => this.changeVariable(v)}>
												{this.variables}
											</select>
										</div>
									</div>}
								</div>

								<div className="form-check" style={{'marginTop': '1em'}}>
									<input className="form-check-input" checked={this.state.subgrid} onChange={this.toggleSubgrid.bind(this)} type="checkbox" id='subgrid'></input>
									{this.state.lattice !== 'glodap' &&
									<label className="form-check-label" htmlFor='subgrid'>Subtract another level or date</label>}
									{this.state.lattice === 'glodap' &&
									<label className="form-check-label" htmlFor='subgrid'>Subtract another level</label>}
								</div>

								<div style={{'display': this.state.subgrid ? 'block' : 'none'}}>
									<div className='row'>
										<div className='col-12'>
											<small className="form-text text-muted">Subtraction Depth Layer [m]</small>
											<select className="form-select" value={this.state.sublevelindex} onChange={(v) => this.changeLevel(v, 'sublevelindex')}>
												{this.levels}
											</select>
										</div>
									</div>
									{this.state.lattice !== 'glodap' && <div className='row'>
										<div className='col-12'>
											<small className="form-text text-muted">Subtraction Month</small>
											<select className="form-select" value={this.state.subtimestep} onChange={(v) => this.changeDate(v, 'subtimestep')}>
												{this.timesteps}
											</select>
										</div>
									</div>}
								</div>

								<div className='row'>
	      							<div className='col-6' style={{'paddingRight': '0px'}}>
										<div className="form-text">
						  					<span>color min</span>
										</div>
										<input 
											type="text" 
											className="form-control minmax" 
											placeholder="Auto" 
											value={this.state.display_min}
                                            onChange={e => this.changeRange(e, 'display_min')}
                                            onBlur={e => {
                                                if(!this.state.suppressBlur){
                                                    this.setState({
                                                        display_min: parseFloat(e.target.defaultValue), 
                                                        user_defined_min: e.target.defaultValue!=='', 
                                                        phase: 'remapData'
                                                    })
                                                }
                                            }}
											onKeyPress={e => {
                                                if(e.key==='Enter'){
                                                    this.setState({
                                                        display_min: parseFloat(e.target.defaultValue), 
                                                        user_defined_min: e.target.defaultValue!=='', 
                                                        phase: 'remapData',
                                                        suppressBlur: true
                                                    })
                                                }
                                            }}
											aria-label="xmin" 
											aria-describedby="basic-addon1"/>
									</div>
									<div className='col-6' style={{'paddingRight': '0px'}}>
										<div className="form-text">
						  					<span>color max</span>
										</div>
										<input 
											type="text"
											className="form-control minmax" 
											placeholder="Auto" 
											value={this.state.display_max}
                                            onChange={e => this.changeRange(e, 'display_max')}
                                            onBlur={e => {
                                                if(!this.state.suppressBlur){
                                                    this.setState({
                                                        display_max: parseFloat(e.target.defaultValue), 
                                                        user_defined_max: e.target.defaultValue!=='', 
                                                        phase: 'remapData'
                                                    })
                                                }
                                            }}
											onKeyPress={e => {
                                                if(e.key==='Enter'){
                                                    this.setState({
                                                        display_max: parseFloat(e.target.defaultValue), 
                                                        user_defined_max: e.target.defaultValue!=='', 
                                                        phase: 'remapData',
                                                        suppressBlur: true
                                                    })
                                                }
                                            }}
											aria-label="xmax" 
											aria-describedby="basic-addon1"/>
									</div>
								</div>
								
								<svg style={{'width':'100%', 'height':'1em', 'marginTop': '1em'}} version="1.1" xmlns="http://www.w3.org/2000/svg">
								  <defs>
								    <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
								      <stop offset="0%" stopColor={this.state.scale(this.state.colormin)} />
								      <stop offset="10%" stopColor={this.state.scale(this.state.colormin + 0.1*(this.state.colormax-this.state.colormin))} />
								      <stop offset="20%" stopColor={this.state.scale(this.state.colormin + 0.2*(this.state.colormax-this.state.colormin))} />
								      <stop offset="30%" stopColor={this.state.scale(this.state.colormin + 0.3*(this.state.colormax-this.state.colormin))} />
								      <stop offset="40%" stopColor={this.state.scale(this.state.colormin + 0.4*(this.state.colormax-this.state.colormin))} />
								      <stop offset="50%" stopColor={this.state.scale(this.state.colormin + 0.5*(this.state.colormax-this.state.colormin))} />
								      <stop offset="60%" stopColor={this.state.scale(this.state.colormin + 0.6*(this.state.colormax-this.state.colormin))} />
								      <stop offset="70%" stopColor={this.state.scale(this.state.colormin + 0.7*(this.state.colormax-this.state.colormin))} />
								      <stop offset="80%" stopColor={this.state.scale(this.state.colormin + 0.8*(this.state.colormax-this.state.colormin))} />
								      <stop offset="90%" stopColor={this.state.scale(this.state.colormin + 0.9*(this.state.colormax-this.state.colormin))} />
								      <stop offset="100%" stopColor={this.state.scale(this.state.colormax)} />
								    </linearGradient>
								  </defs>
								  <rect width="100%" height="1em" fill="url(#grad)" />
								</svg>
								<div style={{'width':'100%', 'textAlign': 'center'}}>
									<span style={{'writingMode': 'vertical-rl', 'textOrientation': 'mixed', 'float': 'left', 'marginTop':'0.5em'}}>{(this.state.subgrid && this.state.display_min>0) ? 0 : this.state.display_min}</span>
									<span>{this.scales+this.state.units}</span>
									<span style={{'writingMode': 'vertical-rl', 'textOrientation': 'mixed', 'float':'right', 'marginTop':'0.5em'}}>{(this.state.subgrid && this.state.display_max<0) ? 0: this.state.display_max}</span>
								</div>
							</div>
						</fieldset>
					</div>

					{/*leaflet map*/}
					<div className='col-lg-9'>
						<MapContainer center={[25, this.state.centerlon]} maxBounds={[[-90,this.state.centerlon-180],[90,this.state.centerlon+180]]} zoomSnap={0.01} zoomDelta={1} zoom={2.05} minZoom={2.05} scrollWheelZoom={true}>
						  <TileLayer
						    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						  />
						  <FeatureGroup ref={this.fgRef}>
						    <EditControl
						      position='topleft'
						      onCreated={p => helpers.onPolyCreate.bind(this)(p)}
						      onDeleted={p => helpers.onPolyDelete.bind(this)(this.defaultPolygon, p)}
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
						    <Polygon key={Math.random()} positions={this.state.interpolated_polygon.map(x => [x[1],x[0]])} fillOpacity={0}></Polygon>
						  </FeatureGroup>
              				{this.state.gridcells}
						</MapContainer>
					</div>
				</div>
			</>
		)
	}
}

export default Grids