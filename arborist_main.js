/*
import Graph from "graphology";
import Sigma from "sigma";
*/

/* functions */
function cssModify(cssValue,funcToApply) {
    var rawValue = parseFloat(cssValue);
    var modifiedValue = funcToApply(rawValue);
    return numToStyle(modifiedValue,postfixOnly(cssValue));
}

function numToStyle(number,unit) {
    let styleForm = number.toString();
    styleForm = styleForm.concat(unit);
    return styleForm;
}

function lapply(vector,func) {
    var result = [];
    for (var i=0; i<vector.length; i++) {
        result.push(func(vector[i]));
    }
    return result;
}

function forgivingParseNum(x) {
    if (typeof(x) == 'string') {
        x = x.replaceAll(',','');
        x = x.replaceAll('%','');
        var parsed = parseFloat(x);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    return parseFloat(x);
}

function forgivingValMax(dict) {
	var allVals = Object.values(dict);
	allVals = lapply(allVals,forgivingParseNum);
	return Math.max(...allVals);
}

function nextAvailableKey(graph) {
	if (graph.nodes().length == 0) {
		return '0';
	} else {
		var candidate = forgivingValMax(graph.nodes()) + 1;
		return candidate.toString();
	}
}

function drawDiv(graph,divToDraw) {
	var newKey = nextAvailableKey(graph);
	var newLabel = concatVec(Object.values(divToDraw.classList));
	var newNode = graph.addNode(newKey, {label: newLabel, size: 5, color: 'black'});
	return newNode;
}

function concatVec(values,separator=', ') {
	var result ='';
	for (var i=0; i<values.length; i++) {
		if (i != (values.length - 1)) {
			result = result.concat(values[i],separator);	
		} else {
			result = result.concat(values[i]);
		}
	}
	return result;
}

function articulateChildren(rootDiv) {
	var allChildren = rootDiv.querySelectorAll('div');
	for (var i=0; i<allChildren.length; i++) {
		articulateChildren(allChildren[i]);
	}
}

function connectToSet(graph,sourceNode,set,sizeToSet=1,colorToSet='black') {
	for (var j=0; j<set.length; j++) {
		graph.addEdge(sourceNode, set[j], {size: sizeToSet, color: colorToSet});
	}
}

function mapRecursive(graph,rootDiv,rootNode,parentX,parentY,radius,startAngle) {
	var allChildren = rootDiv.children;
	if (allChildren.length == 0) {
		console.log('leaf');
		return [];
	} else {
		var drawnNodes = [];
		for (var i=0; i<allChildren.length; i++) {
			var currChild = allChildren[i];
			var currDrawnNode = drawDiv(graph,currChild);
			drawnNodes.push(currDrawnNode);

			const angle = (i / Math.max(...[allChildren.length-1,1])) * (1 * Math.PI) + startAngle + (Math.PI / 2);
			console.log(startAngle);

		    graph.setNodeAttribute(currDrawnNode, "x", parentX + (radius * Math.cos(angle)));
		    graph.setNodeAttribute(currDrawnNode, "y", parentY + (radius * Math.sin(angle)));

			var childNodes = mapRecursive(graph,currChild,currDrawnNode,parentX + (radius * Math.cos(angle)),parentY + (radius * Math.sin(angle)), radius/1.5, angle);
		}
		connectToSet(graph,rootNode,drawnNodes);

		return drawnNodes;
	}
}

function mapWithRoot(graph,rootDiv,rootName='body') {
	var rootNode = drawDiv(graph,rootDiv);
	graph.setNodeAttribute(rootNode,'label',rootName);
	graph.setNodeAttribute(rootNode,'x',0);
	graph.setNodeAttribute(rootNode,'y',0);
	var allChildren = rootDiv.children;
	
	if (allChildren.length == 0) {
		console.log('leaf');
		return [];
	} else {
		var drawnNodes = [];
		for (var i=0; i<allChildren.length; i++) {
			var currChild = allChildren[i];
			var currDrawnNode = drawDiv(graph,currChild);
			drawnNodes.push(currDrawnNode);

			const angle = ((i / Math.max(...[allChildren.length-1,1])) * (1 * Math.PI));
		    graph.setNodeAttribute(currDrawnNode, "x", 0 + (100 * Math.cos(angle)));
		    graph.setNodeAttribute(currDrawnNode, "y", 0 + (100 * Math.sin(angle)));
		    
			var childNodes = mapRecursive(graph,currChild,currDrawnNode,0,0,(100/1.5),angle);
			
		}
		connectToSet(graph,rootNode,drawnNodes); 
		/*
		for (var k=0; k<drawnNodes.length; k++) {
			const angle = (k * 2 * Math.PI) / drawnNodes.length;
		    graph.setNodeAttribute(node, "x",  * Math.cos(angle));
		    graph.setNodeAttribute(node, "y", i * Math.sin(angle));
		}
		*/

		return rootNode;
	}
}

/* create the graph */
const graph = new graphology.Graph();
var graphContainer = document.getElementById('main-tree-container');
graphContainer.style.height = numToStyle(window.innerHeight,'px');

const sigmaInstance = new Sigma(graph, graphContainer);


/* get the divs */
var root = document.getElementById('parent-row');
var rootNode = mapWithRoot(graph,root);
graph.setNodeAttribute(rootNode,'color','red');



/*
graph.nodes().forEach((node, i) => {
	console.log(node.x);
	
    const angle = (i * 2 * Math.PI) / graph.order;
    graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
    graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
    
});
*/


