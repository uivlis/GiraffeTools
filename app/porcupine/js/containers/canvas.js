import { v4 } from 'node-uuid';
import PropTypes from 'prop-types';
import React from 'react';
import { PinchView } from 'react-pinch-zoom-pan';

import { DropTarget } from 'react-dnd';
import { connect } from 'react-redux';

import ItemTypes from '../components/itemTypes';
import Links from './links';
import Nodes from './nodes';
// import zoomFunctions from '../zoomFunctions';
import nodeData from '../../static/assets/nipype.json';
import {
	addNode,
	addPortToNode,
	clickScene,
} from '../actions/index';


const ZoomIn = () => {
	return (
		<div id='icon-plus' className="canvas-icon">
			<p>Press</p>
			<button className="btn btn-default text-center">
					<span aria-hidden="true">+</span>
			</button>
		</div>
	);
}

const ZoomOut = () => {
	return(
		<div id='icon-minus' className="canvas-icon">
			<p>Press</p>
			<button className="btn btn-default text-center">
					<span aria-hidden="true">-</span>
			</button>
		</div>
	);
}


const boxTarget = {
	drop(props, monitor, component) {
		component.drop(monitor.getItem(), monitor.getClientOffset())
		return { name: 'Canvas' }
	},
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.placeholder          = true;
    this.allowDrop            = this.allowDrop.bind(this);
    this.drop                 = this.drop.bind(this);
    this.clickCanvas          = this.clickCanvas.bind(this);
  }

  componentDidMount() {
    this.placeholder = false;
		// #TODO remove/replace zoomFunctions in issue #73
		// setBoundingBox();
    // this.mouseState = zoomFunctions();
  }

  componentDidUpdate() {
    this.placeholder = false;
  }

  allowDrop(event) {
    event.preventDefault();
  }

  drop(item, offset) {
		const { addNode, addPortToNode } = this.props;

    this.placeholder = false;
		const rec = document.getElementById('main').getBoundingClientRect();
		// #TODO to be updated as part of #73:
		// const canvas = document.getElementById('jsplumbContainer');
    // const zoom = instance.getZoom();
    const zoom = 1;
		console.log(rec);

    let category = item.element_type;
    let name = category.splice(-1)[0];
    let currentNodes = nodeData;
    category.forEach(function (c) {
      currentNodes = currentNodes['categories'][c];
    })
    const node = $.extend(true, {}, currentNodes.nodes[name]);

		const newNode = {
			id: v4(),
			name: name,
			// #TODO fix positioning of dropped node, issue #73
			// x: (offset.x - rec.left - canvas.x) / zoom - 45,
			// y: (offset.y - rec.top -  canvas.y) / zoom - 25,
			x: (offset.x - rec.left) / zoom - 45,
			y: (offset.y - rec.top) / zoom - 25,
			colour: currentNodes.colour,
		};

		addNode(newNode);

		node.ports.map((port) => {
			port.id = v4();
			const newPort = {
				id: port.id,
				name: port.name,
				isInput: port.input,
				isOutput: port.output,
				isVisible: port.visible,
				isEditable: port.editable,
			};
			addPortToNode(newPort, newNode.id);
		});
  }

  clickCanvas(event) {
		const { clickScene } = this.props;
		clickScene();
		// #TODO: read placeholder state from state, issue #72
    this.placeholder = false;
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    const props = this.props;

    const { canDrop, isOver, connectDropTarget, nodes } = this.props;
		const isActive = canDrop && isOver

		let backgroundColor = '#222'
		if (isActive) {
			backgroundColor = 'darkgreen'
		} else if (canDrop) {
			backgroundColor = 'darkkhaki'
		}

    let placeholder = null;
    if (this.placeholder){
      placeholder = (<h4 className="text-center" id="placeholder">Drag your nodes here!</h4>);
    }
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;

    return connectDropTarget(
      <div
        className="canvas"
        onDragOver={this.allowDrop}
        onClick={this.clickCanvas}
      >
        {/* {errors} */}
        {/* {placeholder} */}
				{/* #TODO replace this container, issue #73 */}

				<PinchView>
					<div
						id="mainSurface"
					>
	          <Nodes />
						<Links />
					</div>
				</PinchView>

				<ZoomIn />
				<ZoomOut />

        {/*
				<div >
          {isActive ? 'Release to drop' : 'Drag a box here'}
        </div>
         */}

      </div>,
    );
  }
}
Canvas.propTypes = {
  placeholder:          PropTypes.bool,
  // connectDropTarget:    PropTypes.func.isRequired,
  isOver: 		PropTypes.bool.isRequired,
  canDrop: 		PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
	addNode: (node) => dispatch(addNode(node)),
	addPortToNode: (port, nodeId) => dispatch(addPortToNode(port, nodeId)),
	clickScene: () => dispatch(clickScene()),
});

Canvas = DropTarget(ItemTypes.PaneElement, boxTarget, (connection, monitor) => ({
	connectDropTarget: connection.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop(),
}))(Canvas)

export default Canvas = connect(
	mapStateToProps,
	mapDispatchToProps
)(Canvas);
