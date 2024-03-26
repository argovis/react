import React from 'react';

class Hackathon extends React.Component {

	constructor(props) {
		document.title = 'Argovis Hackathon 2024'
		super(props);

		let queryManagement = new URL(window.location)
		window.argoPrevious = queryManagement.search
	}

	render(){
		return(
			<>
				<div className='row'>
					<div className='col-12 hero-wrap'>
						<div className='hero'>
							<h2>Argovis Hackathon 2024</h2>
						</div>
					</div>
				</div>

				<div className='row'>
					<div className='col-12 aboutBlock'>
						<h4>Schedule & Registration</h4>

						<ul>
							<li><b>When:</b> April 29-May 1, 11am-1pm MT each day</li>
							<li><b>Where:</b> online (on Zoom)</li>
							<li><b>How to register for the event</b> (and receive the Zoom link to attend): <b>fill in <a href='https://docs.google.com/forms/d/e/1FAIpQLScgl0YXeKOXqfA10hWhSTg2CTV5vnmFYhuUdZksBAYe0gwMTw/viewform' target="_blank" rel="noreferrer">this Google form</a> by Friday, April 12, 2024</b></li>
						</ul>

						<p>
							For questions about the event, please email: <a href="mailto:donata.giglio@colorado.edu">donata.giglio@colorado.edu</a> or <a href='mscanderbeg@colorado.edu'>mscanderbeg@colorado.edu</a>.
						</p>

						<h4>Description</h4>
						<p>
							We are pleased to invite you to attend <b>an online hackathon on setting up data analysis projects (for research and/or education) in small groups using  the Argovis data service.</b>
						</p>

						<p>
							Argovis (<a href='https://argovis.colorado.edu' target="_blank" rel="noreferrer">argovis.colorado.edu</a>) is a data search, distribution, and visualization service developed at the University of Colorado Boulder that leverages modern technologies to enable <b>targeted searches of and fast access to</b> oceanic profiles (from Argo profiling floats and GO-SHIP hydrography) and derived gridded products, drifter observations, weather events, and satellite data products. (Please find a full list of datasets currently in Argovis at the end of the page).  
						</p>

						<p>
							<b>While the hackathon will provide an introduction to Argovis tailored to the level of expertise of different participants, the focus will be on the setup of specific projects of interest in small groups.</b> Our goal is to develop projects that can be continued after the hackathon, used for research and/or education, and shared with the community.
						</p>

						<p>
							During this hackathon, participants will (1) Learn what resources are available to accelerate research projects and to enhance educational activities, (2) Work in small groups to set up a data analysis project of interest for research and/or education, (3) Provide the Argovis team with feedback on Argovis’ technology and resources made available.
						</p>

						<h4>Datasets* in Argovis:</h4>
						<ul>
							<li>In-Situ obs: Argo profiles, CCHDO ship-based profiles, Global Drifter Program Data</li>
							<li>Grids based on in-situ obs: Roemmich-Gilson Argo Climatology, GO-SHIP Easy Ocean, LocalGP ocean heat content, GLODAPv2</li>
							<li>Grids based on satellite data: Aviso Sea Surface Height, NOAA OI Sea Surface Temperature v2, REMSS cross-calibrated multi-platform winds</li>
							<li>Weather events: Atmospheric River Climatology, Tropical cyclone data</li>
							<li>Other: BSOSE (in progress), Argo trajectories, ARGONE </li>
						</ul>

						<p>*Dataset details at <a href='https://argovis.colorado.edu/about#datasources' target="_blank" rel="noreferrer">https://argovis.colorado.edu/about</a></p>

						<h4>Notes and resources</h4>
						<ul>
							<li>UCSD DataHub: <a href='https://datahub.ucsd.edu/hub' target="_blank" rel="noreferrer">https://datahub.ucsd.edu/hub</a></li>
							<li>Argovis demo notebooks: <a href='https://github.com/argovis/demo_notebooks' target="_blank" rel="noreferrer">https://github.com/argovis/demo_notebooks</a> </li>
							<li>Cloning Argovis demo notebooks: <pre style={{'display':'inline'}}>git clone https://github.com/argovis/demo_notebooks</pre> </li>
							<li>Feedback form (26 March): <a href='https://docs.google.com/forms/d/e/1FAIpQLSdKLD0S3D9N2mgfp7eJTS27CO4d8MhU4ezciEV3ubmMcPWZTQ/viewform' target="_blank" rel="noreferrer">https://docs.google.com/forms/d/e/1FAIpQLSdKLD0S3D9N2mgfp7eJTS27CO4d8MhU4ezciEV3ubmMcPWZTQ/viewform</a></li>
							<li>API docs: <a href='https://argovis-api.colorado.edu/docs/' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/docs/</a></li>
							<li>Zoom root: https://cuboulder.zoom.us/j/</li>

						</ul>

						<div className='row'>
							<div className='col-12' style={{'textAlign': 'center'}}>
								<img alt='' src='fulllogo.png' style={{'width': '10vw', 'margin':'1em'}}></img>
								<img alt='' src='Boulder_FL.jpg' style={{'width': '10vw', 'margin':'1em'}}></img>
								<img alt='' src='EarthCube-Blue-Long.png' style={{'width': '10vw', 'margin':'1em'}}></img>
							</div>
						</div>
					</div>
				</div>
			</>
		)
	}

}

export default Hackathon