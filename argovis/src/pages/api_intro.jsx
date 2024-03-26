import React from 'react';

class APIintro extends React.Component {

	constructor(props) {
		document.title = 'Argovis - API Intro'
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
							<h2>Introduction to Argovis' API</h2>
						</div>
					</div>
				</div>

				<div className='row'>
					<div className='col-12 aboutBlock'>
						<h3>Intro</h3>

						<p>Argovis provides an API that indexes and distributes numerous oceanographic datasets with detailed query parameters, enabling you to search and download only exactly your data of interest. Here we'll tour some of the standard usage patterns enabled by Argovis.</p>

						<h3>Setup: register an API key</h3>
						<p>In order to allocate Argovis's limited computing resources fairly, users are encouraged to register and request a free API key. This works like a password that identifies your requests to Argovis. To do so:</p>
						<ul>
							<li>Visit <a href='https://argovis-keygen.colorado.edu/' target="_blank" rel="noreferrer">https://argovis-keygen.colorado.edu/</a></li>
							<li>Fill out the form under <i>New Account Registration</i></li>
							<li>An API key will be emailed to you shortly.</li>
						</ul>
						<p>Treat this API key like a password - don't share it or leave it anywhere public. If you ever forget it or accidentally reveal it to a third party, see the same website above to change or deactivate your token.</p>
						<p>This API key needs to be passed along with requests under the <pre style={{'display':'inline'}}>x-argokey</pre> API header; see the docs for your client of choice on how to append request headers. Requests without this header will still work, but may be throttled aggressively depending on load.</p>

						<h3>Argovis data structures</h3>
						<p>Argovis standard data structures divide measurements into data and metadata documents. Typically, a data document corresponds to measurements or gridded data associated with a discreet temporospatial column - a time, latitude and longitude. A single such document may contain measurements at multiple depths or altitudes, provided they share the same latitude, longitude, and time.</p>
						<p>Each of these data documents will refer to a corresponding metadata document that captures additional information about the measurement. Argovis divides information between data and metadata documents in order to minimize redundancy in the data you download: many data documents will point to the same metadata document, allowing you to only download that metadata once. Typically, these metadata groupings will refer to some meaningful characteristic of the data; Argo metadata documents correspond to physical floats, while CCHDO metadata documents correspond to cruises, for example.</p>
						<p>For more detail and specifications on the data and metadata documents for each collection, see <a href='https://argovis.colorado.edu/docs/documentation/_build/html/database/schema.html' target="_blank" rel="noreferrer">the schema</a>.</p>

						<h3>The standard data routes</h3>
						
						<h4>What datasets does Argovis index?</h4>
						<p>Argovis supports several different data sets with the API and data structures described here. They and their corresponding routes are:</p>
						<ul>
							<li>Argo profiling float data, <pre style={{'display':'inline'}}>/argo</pre></li>
							<li>CCHDO ship-based profile data, <pre style={{'display':'inline'}}>/cchdo</pre></li>
							<li>tropical cyclone data from HURDAT and JTWC, <pre style={{'display':'inline'}}>/tc</pre></li>
							<li>Global Drifter Program data, <pre style={{'display':'inline'}}>/drifters</pre></li>
							<li>Easy Ocean, <pre style={{'display':'inline'}}>/easyocean</pre></li>
							<li>several gridded products:</li>
							<ul>
								<li>Roemmich-Gilson total temperature and salinity grids, <pre style={{'display':'inline'}}>/grids/rg09</pre></li>
								<li>ocean heat content, <pre style={{'display':'inline'}}>/grids/kg21</pre></li>
								<li>GLODAP, <pre style={{'display':'inline'}}>/grids/glodap</pre></li>
							</ul>
							<li>Argone float location forecasts, <pre style={{'display':'inline'}}>/argone</pre></li>
							<li>Argo float trajectories, <pre style={{'display':'inline'}}>/argotrajectories</pre></li>	
							<li>several satellite-based timeseries:</li>
							<ul>
								<li>NOAA sea surface temperature, <pre style={{'display':'inline'}}>/timeseries/noaasst</pre></li>
								<li>Copernicus sea surface height, <pre style={{'display':'inline'}}>/timeseries/copernicussla</pre></li>
								<li>CCMP wind vector product, <pre style={{'display':'inline'}}>/timeseries/ccmpwind</pre></li>
							</ul>
						</ul>

						<h4>Using Swagger and the Argovis API to download data</h4>
						
						<h5>Using Swagger docs</h5>
						<p>Argovis' API documentation is found at <a href='https://argovis-api.colorado.edu/docs/' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/docs/</a>. These docs are split into several categories; what follows applies to all categories not marked experimental; the experimental categories are under development and may change or be removed at any time.</p>
						<p>Each category has at least three routes:</p>
						<ul>
							<li>The main data route, like <pre style={{'display':'inline'}}>/argo</pre>, or <pre style={{'display':'inline'}}>/cchdo</pre>. These routes provide the data documents for the dataset named in the route.</li>
							<li>The metadata route, like <pre style={{'display':'inline'}}>/argo/meta</pre>. These routes provide the metadata documents referred to by data documents.</li>
							<li>The vocabulary route, like <pre style={{'display':'inline'}}>/argo/vocabulary</pre>. These routes provide lists of possible options for search parameters used in the corresponding data and metadata routes.</li>
						</ul>
						<p>Click on any of the routes, like <pre style={{'display':'inline'}}>/argo</pre> - a list of possible query string parameters are presented, with a short explanation of what they mean.</p>
						<p> Let's try it out by making our first request for Argo data, for profiles found within 100 km of a point in the South Atlantic in May 2011:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2011-05-01T00:00:00Z&endDate=2011-06-01T00:00:00Z&center=-22.5,0&radius=100' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2011-05-01T00:00:00Z&endDate=2011-06-01T00:00:00Z&center=-22.5,0&radius=100</a></p>
						<p>The return JSON are data documents for Argo, matching the specification at <a href='https://argovis.colorado.edu/docs/documentation/_build/html/database/schema.html' target="_blank" rel="noreferrer">https://argovis.colorado.edu/docs/documentation/_build/html/database/schema.html</a>.  It contains the <pre style={{'display':'inline'}}>timestamp</pre> and <pre style={{'display':'inline'}}>geolocation</pre> properties that place this profile geospatially, and other parameters that typically change from point to point.</p>
						<p>All data documents bear a <pre style={{'display':'inline'}}>metadata</pre> key, which is a pointer to the appropriate metadata documents to find out more about this measurement. Let's fetch that document for this first profile by querying the <pre style={{'display':'inline'}}>argo/meta</pre> route for a doument with an id that matches a given metadata pointer:</p>
						<p><a href='https://argovis-api.colorado.edu/argo/meta?id=4901283_m0' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo/meta?id=4901283_m0</a></p>
						<p>In addition to temporospatial searches, data and metadata routes typically support category searches, which are searches for documents that belong to certain categories. Which categories are available to search by changes logically from dataset to dataset; Argo floats can be searched by platform number, for example, while tropical cyclones can be searched by storm name. See the swagger docs for the full set of possibilities for each category; let's now use Argo's platform category search to get all profiles collected by the same platform as the metadata above:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?platform=4901283' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?platform=4901283</a></p>
						<p>For all category searches, we may wish to know the full list of all possible values a category can take on; for this, there are the vocabulary routes. Let's get a list of all possible Argo platforms we can search by:</p>
						<p><a href='https://argovis-api.colorado.edu/argo/vocabulary?parameter=platform' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo/vocabulary?parameter=platform</a></p>

						<h4>Using the data query option</h4>
						<p>The astute reader may have noticed something about the data document shown above: there's no actual measurements included in it! By default, only the non-measurement data is returned, in order to minimize bandwidth consumed; in order to get back actual measurements and their QC flags, we must query and filter including the <pre style={{'display':'inline'}}>data</pre> parameter, the behavior of which we'll see in this section.</p>
						
						<h5>Basic data request</h5>
						<p>Let's start by asking for one particular profile by ID, and ask for some temperature data to go with:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?id=4901283_003&data=temperature' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?id=4901283_003&data=temperature</a></p>
						<p>We see the returned profile now has a <pre style={{'display':'inline'}}>data</pre> key, and that key holds an array of arrays of measurements. In order to understand these arrays, have a look at the <pre style={{'display':'inline'}}>data_info</pre> object. This object always consists of three arrays, and the first labels the measurements seen in <pre style={{'display':'inline'}}>data</pre>; note in this example, <pre style={{'display':'inline'}}>pressure</pre> was added to the list even though we only requested temperature, since pressure information is necessary for contextualizing all other measurements. Furthermore, <pre style={{'display':'inline'}}>data_info[2]</pre> provides a 2D matrix of metadata for our data variables; rows of this matrix are labled by <pre style={{'display':'inline'}}>data_info[0]</pre>, while columns are lableed by <pre style={{'display':'inline'}}>data_info[1]</pre>.</p>
					
						<p>What we've seen above allows us to be very targeted in the data we download; rather than being forced to spend time and bandwidth downloading data we aren't interested in, we can focus on just what we need. On the other hand, somtimes we really do want everything, and for that there's <pre style={{'display':'inline'}}>data=all</pre>:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?id=4901283_003&data=all' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?id=4901283_003&data=all</a></p>

						<h5>Filtering behavior of data requests</h5>
						<p>Note that adding a specific data filter is a firm requirement that all returned profiles have some meaningful data for all variables listed. Try demanding chlorophyl-a in addition to temperature for our current profile of interest:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?id=4901283_003&data=temperature,chla' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?id=4901283_003&data=temperature,chla</a></p>
						<p>We get nothing in our array of profiles; even though we asked for profile id '4901283_003' and we know it exists, data=temperature,chla filters our query down to only profiles that have both temperature and chla reported; since the profile requested doesn't have any chla measurements, it is dropped from the returns in this case. This is useful if you only want to download profiles that definitely have data of interest; for example, try the same thing on our regional search from above:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2011-05-01T00:00:00Z&endDate=2011-06-01T00:00:00Z&center=-22.5,0&radius=100&data=temperature,chla' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2011-05-01T00:00:00Z&endDate=2011-06-01T00:00:00Z&center=-22.5,0&radius=100&data=temperature,chla</a></p>
						<p>Evidently Argo made no chlorophyl-a measurements in May 2011 within 100 km of our point of interest - a fact which we found using the data api without having to download or reduce any data at all. One final point on data filtering in this manner: it's not enough for a profile to nominally have a variable defined for it; it must have at least one non-null value reported for that variable somewhere in the search results. For example, when we did <pre style={{'display':'inline'}}>data=all</pre> for our profile of interest above, we saw dissolved oxygen, <pre style={{'display':'inline'}}>doxy</pre>, was defined for it. But:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2011-05-01T00:00:00Z&endDate=2011-06-01T00:00:00Z&center=-22.5,0&radius=100&data=doxy' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2011-05-01T00:00:00Z&endDate=2011-06-01T00:00:00Z&center=-22.5,0&radius=100&data=doxy</a></p>
						<p>Again our search is filtered down to nothing, since every level in that profile reported <pre style={{'display':'inline'}}>None</pre> for <pre style={{'display':'inline'}}>doxy</pre>.</p>

						<h5>Search negation</h5>
						<p>Let's find some profiles that do actually have dissolved oxygen in them, this time with a slightly different geography search: let's look for everything in August 2017 within a polygon region, defined as a list of <pre style={{'display':'inline'}}>[longitude, latitude]</pre> points:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=doxy' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=doxy</a></p>
						<p>We find one profile with meaningful dissolved oxygen data in the region of interest.</p>
						<p>The data key also accepts tilde negation, meaning 'filter for profiles that don't contain this data', for example:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=temperature,~doxy' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=temperature,~doxy</a></p>
						<p>We get a collection of profiles that appear in the region of interest, and have temperature but not dissolved oxygen. In this way, we can split up our downloads into groups of related and interesting profiles without re-downloading the same profiles over and over.</p>

						<h5>QC filtering</h5>
						<p>In addition to querying and filtering by what data is available, we can also make demands on the quality of that data by performing QC filtering. Let's start by looking at some particulate backscattering data:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?id=2902857_001&data=bbp700,bbp700_argoqc'>https://argovis-api.colorado.edu/argo?id=2902857_001&data=bbp700,bbp700_argoqc</a></p>
						<p>We request both the measurement and its corresponding QC flags, for reference. Recall that for Argo:</p>
						<ul>
							<li>QC=1 means data is definitely good</li>
							<li>QC=2 means data is probably good</li>
							<li>QC=3 means data is probably bad</li>
							<li>QC=4 means data is definitely bad</li>
						</ul>
						<p>If we didn't look at the QC flags for our particulate backscatter data, we could easily have missed that some of the measurements shown above (and many more in the profile not printed) have been marked as bad data by the upstream data distributor, and therefore might not be appropriate for your purposes. We can suppress measurements based on a list of allowed QC values by modifying what we pass to the data query parameter:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?id=2902857_001&data=bbp700,1,bbp700_argoqc'>https://argovis-api.colorado.edu/argo?id=2902857_001&data=bbp700,1,bbp700_argoqc</a></p>
						<p>In our data query parameter, we listed which QC flags we find tolerable for each measurement parameter; in this case bbp700,1 indicates we only want bbp700 data if it has a corresponding QC flag of 1. Some things implied by this example that are worth highlighting:</p>
						<ul>
							<li>QC flags listed after a variable name only apply to that variable name. Try printing the pressure record for the profile found above, and you'll see none of its levels were suppressed.</li>
							<li>The list of QC flags is an explicit-allow list and can contain as many flags as you want. For example, you might change the above data query to bbp700,1,2 to get both 1- and 2-flagged bbp700 measurements back.</li>
							<li>We include the explicit QC flag in this example for illustrative purposes, but it's not required when doing QC filtering in this way. Try the above query while omitting bbp700_argoqc, and you'll get the same non-None values for bbp700.</li>
							<li>ote however, as with all data requests, if all explicitly requested data variables are None for a level, that level is dropped. In the case where you omitted bbp700_argoqc and only requested bbp700, the levels where the QC filtration set the bbp700 value to None are dropped.</li>
							<li>Similarly, if all levels of a requested variable are set to None by QC filtration, the entire profile will be dropped from the returns, on the grounds that it doesn't contain any of the data you requested at a level of quality you marked as acceptable.</li>
						</ul>

						<h5>Minimal data responses</h5>
						<p>Sometimes, we might want to use the <pre style={{'display':'inline'}}>data</pre> filter as we've seen to confine our attention to only profiles that have data of interest, but we're only interested in general or metadata about those measurements, and don't want to download the actual measurements; for this, we can add the <pre style={{'display':'inline'}}>except-data-values</pre> token:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=doxy,except-data-values' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=doxy,except-data-values</a></p>
						<p>If we want an even more minimal response, we can use the <pre style={{'display':'inline'}}>compression=minimal</pre> option:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=doxy&compression=minimal' target="_blank" rel="noreferrer">https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00Z&endDate=2017-09-01T00:00:00Z&polygon=[[-150,-30],[-155,-30],[-155,-35],[-150,-35],[-150,-30]]&data=doxy&compression=minimal</a></p>
						<p>With <pre style={{'display':'inline'}}>compression=minimal</pre>, for each profile we get only the ID, longitude, latitude, timestamp and list of data sources; this is intended for mapping applications that want to show this data on a map, and use the ID to link out to additional data with another query.</p>

						<h5>Temporospatial request details</h5>
						<p>You have seen in examples above that requests can be temporally limited by startDate and endDate, and confined to a geographic region with polygon. There are a few more features and facts about temporospatial requests in Argovis that are worth exploring.</p>
						<h6>Very large spatial extents</h6>
						<p>Argovis uses geojson polygons to define spatial regions of interest, as illustrated above. If we consider only vertexes, ambiguity exists: are we describing the portion of the globe on one side of the polygon line, or the other? By default, MongoDB and Argovis assume you are asking for the smaller of the two regions. If in fact you want the larger, we must use the winding order of points in the polygon to disambiguate. If we want the larger region, we must tell the API to consider winding order, and make sure the polygon vertexes are listed in counter-clockwise order around our region of interest, like so (note the number of profiles returned):</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&polygon=[[-40,35],[-40,45],[-30,45],[-30,35],[-40,35]]&winding=true&compression=minimal'>https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&polygon=[[-40,35],[-40,45],[-30,45],[-30,35],[-40,35]]&winding=true&compression=minimal</a></p>
						<p>Note that if we leave off the winding: 'true' part, we get the smaller region regardless of winding (again see the number of profiles - much less this time since we're taking the smaller region by default):</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&polygon=[[-40,35],[-40,45],[-30,45],[-30,35],[-40,35]]&compression=minimal'>https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&polygon=[[-40,35],[-40,45],[-30,45],[-30,35],[-40,35]]&compression=minimal</a></p>
						<p>Or, if we keep the winding requirement but reverse the winding of polygon, again we get the smaller region:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&polygon=[[-40,35],[-30,35],[-30,45],[-40,45],[-40,35]]&winding=true&compression=minimal'>https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&polygon=[[-40,35],[-30,35],[-30,45],[-40,45],[-40,35]]&winding=true&compression=minimal</a></p>
						<h6>Region intersections</h6>
						<p>In the event we are curious to see results that are interior to the intersection of two or more polygons, Argovis also presents a multipolygon option:</p>
						<p><a href='https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&multipolygon=[[[-40,35],[-40,45],[-30,45],[-30,35],[-40,35]],[[-35,35],[-35,45],[-25,45],[-25,35],[-35,35]]]&compression=minimal'>https://argovis-api.colorado.edu/argo?startDate=2023-01-01T00:00:00Z&endDate=2023-01-10T00:00:00Z&multipolygon=[[[-40,35],[-40,45],[-30,45],[-30,35],[-40,35]],[[-35,35],[-35,45],[-25,45],[-25,35],[-35,35]]]&compression=minimal</a></p>
						<p>Note the profiles returned in this case are interior to both polygons listed. There's no limit to the number of polygons you can list in multipolygon; each will further filter down the number of profiles returned to be interior to all of them.</p>
						<h6>Box regions</h6>
						<p>The polygon region definitions you've seen so far define regions on the globe by connecting vertexes with geodesic edges. If instead we want a region bounded by lines of constant latitude and longitude, there is the box query string parameter. Compare two similar but different searches, first with polygon, similar to the above, tracing geodesics between four corners of a region, and second with a box mode query:</p>
						<a href='https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00.000000Z&endDate=2017-09-01T00:00:00.000000Z&polygon=[[-20,70],[20,70],[20,72],[-20,72],[-20,70]]'>https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00.000000Z&endDate=2017-09-01T00:00:00.000000Z&polygon=[[-20,70],[20,70],[20,72],[-20,72],[-20,70]]</a>
						<p>versus</p>
						<a href='https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00.000000Z&endDate=2017-09-01T00:00:00.000000Z&box=[[-20,70],[20,72]]'>https://argovis-api.colorado.edu/argo?startDate=2017-08-01T00:00:00.000000Z&endDate=2017-09-01T00:00:00.000000Z&box=[[-20,70],[20,72]]</a>
						<p>In your programming language of choice, find the minimum and maximum latitudes of profiles returned by each query. Notice that while both regions share the same corners, the polygon search actually returns profiles with latitudes higher than the region's northermost corners since geodesics between two points sharing a latitude deflect north in this far-north search region. Meanwhile, the latitudes of profiles in the box region are confined between the lines of constant latitude connecting the vertexes and defining the top and bottom of the box.</p>
						<p>A final note on box mode notation: note that box mode expects exactly two vertexes: the most southern and western corner first, followed by the most northern and eastern corner.</p>
					</div>
				</div>
			</>
		)
	}

}

export default APIintro