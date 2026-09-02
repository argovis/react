import React from 'react';

class ArgoAbout extends React.Component {

	constructor(props) {
		document.title = 'Argovis - About'
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
							<h2>About Argovis</h2>
						</div>
					</div>
				</div>

				<div className='row'>
					<div className='col-12 aboutBlock'>
						<h3>Intro</h3>

						<p>Argovis is a REST API and web application for searching, downloading, co-locating 
						and visualizing oceanographic data, including Argo array data, ship-based profile data,
						data from the Global Drifter Program, tropical cyclone data, and several gridded products. Our API
						is meant to be integrated into living documents like Jupyter notebooks and analyses intended to 
						update their consumption of Argo data in near-real-time, and our web frontend is intended to
						make it easy for students and educators to explore data about Earth's oceans at will.</p>

						<p>The <a href='https://argovis.colorado.edu/'>landing page</a> of Argovis shows colocated data. 
						For access to individual products (point or gridded data), 
						see the "Explore" menu, e.g. the Argo profile page is <a href='https://argovis.colorado.edu/argo'>here</a>.</p>

						<h3>News & events</h3>
						<ul>
							<li><b>29 April - 1 May 2024:</b> <a href='/hackathon'>Online Argovis Hackathon</a></li>
							<li>In person Argovis working sessions:
								<ul>
									<li><b>March 26 2024, 11:00-12:30 PT:</b> Scripps Institution of Oceanography, University of California San Diego</li>
									<li><b>April 16 2024, 11:00-12:30 MT:</b> University of Colorado Boulder</li>
								</ul>
							</li>
							<li><b>19-22 February 2024:</b> Argovis booth at <a href='https://www.agu.org/ocean-sciences-meeting' target="_blank" rel="noreferrer">OSM2024</a></li>
							<li><b>14-16 June 2022:</b> Argovis featured at the <a href='https://www.conftool.org/earthcube2022/sessions.php' target="_blank" rel="noreferrer">2022 EarthCube Annual Meeting</a></li>
							<li><b>2-4 May 2022:</b> Argovis Hackathon</li>
						</ul>

						<h3>User guide</h3>
						<p>More educational resources for using Argovis are planned for the near future. For now, Python users can see our <a href='https://github.com/argovis/demo_notebooks' target="_blank" rel="noreferrer">collection of Jupyter notebooks</a> for 
							examples on how to consume our API; for a language agnostic introduction, see <a href='/apiintro' target="_blank" rel="noreferrer">this document</a>.
							Complete API docs are always up to date via <a href='https://argovis-api.colorado.edu/docs/' target="_blank" rel="noreferrer">Swagger</a>.
							Try exploring our <a href='/' target="_blank" rel="noreferrer">web app</a> in Firefox or any
							webkit browser (Chrome, Safari, Brave) on your laptop / desktop, or in Chrome or Safari on your mobile 
							device.
						</p>

						<h3>The Argovis team</h3>
						<div className='row'>
							<div className='col-sm-2'><img alt='' src='donata_giglio2_crop.jpg' style={{'width':'100%'}}></img></div>
							<div className='col-sm-10'>
								<p><b>Donata Giglio</b> is an Assistant Professor in the Department of Atmospheric and Ocean
								Science at University of Colorado Boulder and is the PI of the Argovis project. Her research 
								interests are in large scale ocean-atmosphere dynamics, geophysical fluid dynamics, data science,
								accessibility and visualization.</p>
							</div>
						</div>
						<div className='row' style={{'paddingTop': '1em'}}>
							<div className='col-sm-2'><img alt='' src='katie-selfie.jpg' style={{'width':'100%'}}></img></div>
							<div className='col-sm-10'>
								<p><b>Katie Mills</b> is a scientific software developer based in Brooklyn, NY. She
								started her career by developing novel reconstruction algorithms in high energy particle 
								physics for the ATLAS experiment at the LHC, and developed web apps for the nuclear
								structure community for years before heading to the private sector to teach organizations
								how to design and operate software at scale using Docker and Kubernetes. She is currently
								working in Prof. Giglio's group at University of Colorado Boulder as the lead engineer
								on Argovis.</p>
							</div>
						</div>
						<div className='row' style={{'paddingTop': '1em'}}>
							<div className='col-sm-2'><img alt='' src='scanderbeg_head_shot_sm.jpg' style={{'width':'100%'}}></img></div>
							<div className='col-sm-10'>
								<p><b>Megan Scanderbeg</b> is the Argo Program Science Coordinator and the Argo Data Management Team 
								Co-chair. She works at Scripps Institution of Oceanography and is interested in making 
								oceanographic data freely available and understandable for all.</p>
							</div>
						</div>
						<div className='row' style={{'paddingTop': '1em'}}>
							<div className='col-sm-2'><img alt='' src='ttucker_crop.jpg' style={{'width':'100%'}}></img></div>
							<div className='col-sm-10'>
								<p><b>Tyler Tucker</b> lives and works (and plays) on the Big Island of Hawaii. He is currently
								a scientific software engineer at the W. M. Keck Observatory on the Big Island. In 2019-2020, he
								worked as a Research Assistant in Professor Giglio's group at University of Colorado Boulder. Tyler
								started developing Argovis as part of a Master's thesis entitled "Mathematics and big data technology
								development to visualize, deliver and analyze IMS and Argo data," defended in May 2018 at San Diego
								State University. The Argovis project started in 2017 when Tyler was an Applied Mathematics MS
								student at the Climate Informatics Lab, San Diego State University, supervised by Professor
								Samuel Shen, and working in collaboration with Donata Giglio and Megan Scanderbeg.</p>
							</div>
						</div>
						<div className='row' style={{'paddingTop': '1em'}}>
							<div className='col-12'>
								<h4>Collaborators</h4>
								<ul>
									<li><b>NSF project award #2026954</b> to include GO-SHIP data in Argovis: Dr. Sarah Purkey, Steve
									Diggs, Lynne Merchant, Andrew Barna.</li>
									<li><b>NOAA project award #NA21OAR4310261</b> to produce a new Argo gridded product with
									uncertainties and include it in Argovis: Dr. Mikael Kuusela.</li>
									<li><b>Others, current and past</b>: Sam Shen, Gui Castelao, Matt Mazloff, Aneesh Subramanian, 
									Lynne Talley, Julien Pierret, Shane Elipot, Philippe Miron.</li>
								</ul>
							</div>
						</div>

						<h3>How to cite</h3>
						<p>See the <a href='/citations'>Citations page</a> for instructions on how to cite Argovis and its upstream datasets.</p>

						<h3>Acknowledgements</h3>
						<p>Argovis is hosted on a server of the Department of Atmospheric and Oceanic Sciences (ATOC) at the 
						University of Colorado Boulder. <b>Currently, Argovis is funded by the NSF Physical Oceanography, GEO Cyberinfrastructure, Polar Cyberinfrastructure, Software Institutes programs (<a href='https://www.nsf.gov/awardsearch/showAward?AWD_ID=2311919&HistoricalAwards=false'>Award #2311919</a>).</b></p>
						<p>In the past, Argovis has been funded by (starting with the most recent):</p>
						<ul>
							<li>NSF Earthcube program (<a href='https://www.nsf.gov/awardsearch/showAward?AWD_ID=2026954&HistoricalAwards=false'>Award #2026954</a>)</li>
                            <li>NSF Earthcube program (<a href='https://www.nsf.gov/awardsearch/showAward?AWD_ID=1928305&HistoricalAwards=false'>Award #1928305</a>)</li>
							<li>Giglio's research funds provided by University of Colorado Boulder</li>
							<li>the SOCCOM Project through grant number NSF PLR-1425989</li>
							<li>the US Argo Program through NOAA Grant NA15OAR4320071 (CIMEC)
								the National Oceanic and Atmospheric Administration – Cooperative Science Center for Earth System Sciences and Remote Sensing Technologies (NOAA-CREST) under the Cooperative Agreement Grant \#: NA16SEC4810008</li>
							<li>the U.S. NOAA Cooperative Institute for Climate Science (Award No. 13342-Z7812001)</li>
							<li>The City College of New York, NOAA-CREST program and NOAA Office of Education, Educational Partnership Program which provided full fellowship support to Tyler Tucker at San Diego State University</li>
						</ul>
						<p>The initial development of Argovis referenced the codes and ideas of the 4-Dimensional Visual Delivery 
						(4DVD) technology developed at the Climate Informatics Lab, San Diego State University. The computer code 
						for 4DVD is at <a href='https://github.com/dafrenchyman/4dvd' target="_blank" rel="noreferrer">https://github.com/dafrenchyman/4dvd</a>, and is available for download under the GNU General 
						Public License open source license. All applicable restrictions, disclaimers of warranties, and limitations 
						of liability in the GNU General Public License also applies to uses of 4DVD on this website.</p>

						<h3>Contact us</h3>
						<p>Please contact us with any questions or issues with Argovis.</p>
						<p>argovis@colorado.edu</p>
						<p>Donata Giglio, University of Colorado Boulder</p>
						<p>donata.giglio@colorado.edu</p>
						<p>Katie Mills, University of Colorado Boulder</p>
						<p>Katie.Mills@colorado.edu</p>
						<p>Megan Scanderbeg, Scripps Institution of Oceanography</p>
						<p>mscanderbeg@ucsd.edu</p>

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

export default ArgoAbout
