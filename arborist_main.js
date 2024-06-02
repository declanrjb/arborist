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

function generateDivLabel(div) {
	if (div.hasAttribute('id')) {
		return '#' + div.getAttribute('id');
	} else if (div.classList.length > 0) {
		return '.' + div.classList[0];
	} else {
		return '<' + div.tagName + '>';
	}
}

function drawDiv(graph,divToDraw,nodeSize=5) {
	var newKey = nextAvailableKey(graph);
	var newLabel = generateDivLabel(divToDraw);
	var newNode = graph.addNode(newKey, {label: newLabel, size: nodeSize, color: 'black'});
	graph.setNodeAttribute(newNode,'divSRC',wrapperHTML(divToDraw));

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

function mapRecursive(graph,rootDiv,rootNode,parentX,parentY,radius,spin,nodeSize=5) {
	var allChildren = rootDiv.children;
	if (allChildren.length == 0) {
		return [];
	} else {
		var drawnNodes = [];
		const sizeReduction = 1.25;
		for (var i=0; i<allChildren.length; i++) {
			var currChild = allChildren[i];
			var currDrawnNode = drawDiv(graph,currChild,nodeSize);
			drawnNodes.push(currDrawnNode);

			const angle = ((i / Math.max(...[allChildren.length-1,1])) * (Math.PI / 1.5)) + spin;

		    graph.setNodeAttribute(currDrawnNode, "x", parentX + (radius * Math.cos(angle)));
		    graph.setNodeAttribute(currDrawnNode, "y", parentY + (radius * Math.sin(angle)));

			var childNodes = mapRecursive(graph,currChild,currDrawnNode,parentX + (radius * Math.cos(angle)),parentY + (radius * Math.sin(angle)), radius/1.5, spin, nodeSize/sizeReduction);
		}
		connectToSet(graph,rootNode,drawnNodes);

		return drawnNodes;
	}
}

function mapWithRoot(graph,rootDiv,rootName='body',nodeSize=10) {
	var rootNode = drawDiv(graph,rootDiv,nodeSize);
	graph.setNodeAttribute(rootNode,'label',rootName);
	graph.setNodeAttribute(rootNode,'x',0);
	graph.setNodeAttribute(rootNode,'y',0);
	var allChildren = rootDiv.children;
	
	if (allChildren.length == 0) {
		return [];
	} else {
		var drawnNodes = [];
		const spin = -((Math.PI / 3) + (Math.PI / 2));
		const sizeReduction = 1.25;
		for (var i=0; i<allChildren.length; i++) {
			var currChild = allChildren[i];
			var currDrawnNode = drawDiv(graph,currChild,nodeSize/sizeReduction);
			drawnNodes.push(currDrawnNode);

			const angle = ((i / Math.max(...[allChildren.length-1,1])) * (Math.PI / 1.5)) + spin;
		    graph.setNodeAttribute(currDrawnNode, "x", 0 + (100 * Math.cos(angle)));
		    graph.setNodeAttribute(currDrawnNode, "y", 0 + (100 * Math.sin(angle)));
		    
			var childNodes = mapRecursive(graph,currChild,currDrawnNode,0 + (100 * Math.cos(angle)),0 + (100 * Math.sin(angle)),(100/1.5),spin,nodeSize/(sizeReduction ** 2));
			
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

function wrapperHTML(div) {
	var outer = div.outerHTML;
	var inner = div.innerHTML;
	var wrapper = outer.replace(inner,'');
	return wrapper;
}

/* page setup */

var pageOverview = document.getElementById('arborist-full-container');
pageOverview.style.height = numToStyle(window.innerHeight,'px');

/* create the graph */
const graph = new graphology.Graph();
var graphContainer = document.getElementById('main-tree-container');

var sigmaInstance = new Sigma(graph, graphContainer);

const htmlReadout = document.getElementById('primary-html-readout');

fetch('https://rvest.tidyverse.org/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
	.then(function(response) {
        // When the page is loaded convert it to text
        return response.text()
    })
    .then(function(html) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");

        // You can now even select part of that html as you would in the regular DOM 
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        var scrape = doc;
        console.log(document);
        console.log(scrape);

        /* get the divs */
		var root = scrape.getElementsByTagName('body')[0];
		console.log(root);
		var rootNode = mapWithRoot(graph,root);
		graph.setNodeAttribute(rootNode,'color','red');

		sigmaInstance.on("enterNode", ({ node }) => {
			var attrTable = graph.getNodeAttributes(node);
			htmlReadout.textContent = attrTable['divSRC'];
			htmlReadout.style.display = 'block';
		});

		sigmaInstance.on("leaveNode", ({ node }) => {
			htmlReadout.textContent = '';
			htmlReadout.style.display = 'none';
		});
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });

const triggerButton = document.getElementById('url-submit-button');
const urlField = document.getElementById('url-entry-field');

triggerButton.onclick = function() {
	var searchTerm = urlField.value;
	urlField.value = '';
	sigmaInstance.graph.clear();
	fetch(searchTerm, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
	.then(function(response) {
        // When the page is loaded convert it to text
        return response.text()
    })
    .then(function(html) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");

        // You can now even select part of that html as you would in the regular DOM 
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        var scrape = doc;
        console.log(document);
        console.log(scrape);

        /* get the divs */
		var root = scrape.getElementsByTagName('body')[0];
		console.log(root);
		var rootNode = mapWithRoot(graph,root);
		graph.setNodeAttribute(rootNode,'color','red');

		sigmaInstance.on("enterNode", ({ node }) => {
			var attrTable = graph.getNodeAttributes(node);
			htmlReadout.textContent = attrTable['divSRC'];
			htmlReadout.style.display = 'block';
		});

		sigmaInstance.on("leaveNode", ({ node }) => {
			htmlReadout.textContent = '';
			htmlReadout.style.display = 'none';
		});
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });
}


