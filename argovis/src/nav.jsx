// top navigation bar on all argovis pages

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

class ArgovisNav extends React.Component {
	render(){
		return(
			<nav className="navbar navbar-expand-lg bg-light">
			  <div className="container-fluid">
			    <a className="navbar-brand" href="https://github.com/argovis"><img alt='' src={'/fulllogo.png'} style={{'height':'30px'}} className='img-fluid'/></a>
			    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
			      <span className="navbar-toggler-icon"></span>
			    </button>
			    <div className="collapse navbar-collapse" id="navbarNav">
			      <ul className="navbar-nav mr-auto">
			      	<li className='nav-item'>
						    <DropdownButton id="explore-dropdown" title="Explore">
						      <h6 className="dropdown-header">Datasets</h6>
					        <Dropdown.Item className="dropdown-item" href="/argo">Argo profiles</Dropdown.Item>
					        <Dropdown.Item className="dropdown-item" href="/ships">Ship-based profiles</Dropdown.Item>
					        <Dropdown.Item className="dropdown-item" href="/drifters">Global drifter program</Dropdown.Item>
					        <Dropdown.Item className="dropdown-item" href="/tc">Tropical cyclones</Dropdown.Item>
					        <div className="dropdown-divider"></div>
					        <h6 className="dropdown-header">Gridded Products</h6>
					        <Dropdown.Item className="dropdown-item" href="/grids?lattice=rg09&grid=rg09_temperature">RG Temperature</Dropdown.Item>
					        <Dropdown.Item className="dropdown-item" href="/grids?lattice=rg09&grid=rg09_salinity">RG Salinity</Dropdown.Item>
					        <Dropdown.Item className="dropdown-item" href="/grids?lattice=kg21&grid=kg21_ohc15to300">KG Ocean heat content</Dropdown.Item>
						    </DropdownButton>
						  </li>
			      	<li className="nav-item">
			          <a className="nav-link" href="/">Colocation</a>
			        </li>
			        <li className="nav-item">
			        	<DropdownButton id="api-dropdown" title="APIs">
					        <Dropdown.Item className="dropdown-item" href="https://argovis-api.colorado.edu/docs/">Core API</Dropdown.Item>
					        <Dropdown.Item className="dropdown-item" href="http://100.26.32.238:8080/docs/">Global Drifter Program API</Dropdown.Item>
						    </DropdownButton>
						  </li>
			        <li className="nav-item">
			          <a className="nav-link" href="https://github.com/argovis/demo_notebooks">Jupyter Notebooks</a>
			        </li>
			        <li className="nav-item">
			          <a className="nav-link" href="https://github.com/argovis">Publications</a>
			        </li>
			        <li className="nav-item">
			          <a className="nav-link" href="/about">About</a>
			        </li>
			        <li className="nav-item">
			        	<a className="nav-link btn btn-primary" href="/hackathon" style={{'color':'#FFFFFF'}}>Argovis Hackathon 2024</a>
			        </li>
			      </ul>
			    </div>
			  </div>
			</nav>
		)
	}
}

export default ArgovisNav