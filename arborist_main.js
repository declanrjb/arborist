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
	graph.setNodeAttribute(newNode,'divTag',divToDraw.tagName);

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

			const angle = ((i / Math.max(...[allChildren.length-1,1])) * (Math.PI / 2)) - (Math.PI/4);

		    graph.setNodeAttribute(currDrawnNode, "x", parentX + (radius * Math.tan(angle)));
		    graph.setNodeAttribute(currDrawnNode, "y", parentY + (radius));

			var childNodes = mapRecursive(graph,currChild,currDrawnNode,parentX + (radius * Math.tan(angle)),parentY + (radius), Math.sqrt(radius), spin, nodeSize/sizeReduction);
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
	var topRadius = 10;
	
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

			const angle = ((i / Math.max(...[allChildren.length-1,1])) * (Math.PI / 2)) - (Math.PI / 4);
		    graph.setNodeAttribute(currDrawnNode, "x", 0 + (topRadius * Math.tan(angle)));
		    graph.setNodeAttribute(currDrawnNode, "y", 0 + (topRadius));
		    
			var childNodes = mapRecursive(graph,currChild,currDrawnNode,0 + (topRadius * Math.tan(angle)),0 + (topRadius),Math.sqrt(topRadius),spin,nodeSize/(sizeReduction ** 2));
			
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

function produceMatrix(n,rule) {
    result = [];
    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            result[(i*n)+j] = rule(i,j);
        }
    }
    return result;
}

function makeEvenConstrastMatrixRule(contrast) {
    function evenConstrastMatrixRule(i,j) {
        if (i == j) {
            return 0;
        } else {
            return contrast;
        }
    }
    return evenConstrastMatrixRule;
}

function retrievePaletteFromResponse(response,index='0') {
    return response['results'][index]['palette'];
}

function addLegendItem(legendContainer,itemText,itemColor) {
	var legendItem = document.createElement('div');
	legendItem.classList.add('legend-item');

	var legendBlot = document.createElement('div');
	legendBlot.classList.add('legend-blot');
	legendBlot.style.backgroundColor = itemColor;
	legendItem.appendChild(legendBlot);

	var legendText = document.createElement('div');
	legendText.classList.add('legend-text');
	legendText.textContent = itemText;
	legendItem.appendChild(legendText);

	legendItem.style.backgroundColor = itemColor;

	legendContainer.appendChild(legendItem);
}

function clearLegend(container) {
	container.innerHTML = '';
}

function colorizeNodes(graph) {
	clearLegend(legendContainer);
	const targetAttribute = 'divTag';
	var uniqueLabels = [];
	graph.nodes().forEach((node, i) => {
		var currAttrs = graph.getNodeAttributes(node);
		if (!uniqueLabels.includes(currAttrs[targetAttribute])) {
			uniqueLabels.push(currAttrs[targetAttribute]);
		}
	});

	if (uniqueLabels.length > 12) {
		uniqueLabels = uniqueLabels.slice(0,12);
	}

    var adjancencyFiller = produceMatrix(uniqueLabels.length,makeEvenConstrastMatrixRule(75));
    
    var huemint_query = {
        "mode":"transformer", // transformer, diffusion or random
        "num_colors":uniqueLabels.length, // max 12, min 2
        "temperature":"2.4", // max 2.4, min 0
        "num_results":10, // max 50 for transformer, 5 for diffusion
        "adjacency":adjancencyFiller, // nxn adjacency matrix as a flat array of strings
    }
    $.ajax({
        type: "post",
        url: "https://api.huemint.com/color",
        data: JSON.stringify(huemint_query),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })
    .then(response => {
        var palette = retrievePaletteFromResponse(response);
        var loggedColors = {};

        graph.nodes().forEach((node, i) => {
			var currRow = node;
            var currColor = NaN;
            var currAttrTable = graph.getNodeAttributes(node);
            var currColorValue = currAttrTable[targetAttribute];
            if (!(currColorValue in loggedColors)) {
            	if (palette.length > 0) {
            		loggedColors[currColorValue] = palette.pop();
            	} else {
            		loggedColors[currColorValue] = 'black';
            	}
            	addLegendItem(legendContainer,'<' + currColorValue + '>',loggedColors[currColorValue]);
            }
            currColor = loggedColors[currColorValue];
            graph.setNodeAttribute(node,'color',currColor);
		});
    })
}


function cleanURL(url) {
	url = 'https://agile-basin-91517-8cd8112fcea7.herokuapp.com/' + url;
	return url;
}

function updateTree(url) {
	searchingSpinner.style.display = 'inline';
	goTag.style.display = 'none';
	sigmaInstance.graph.clear();
	var userAddress = url;
	url = cleanURL(url);
	fetch(url, {
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

        var scrape = doc;
        siteNameElem.textContent = scrape.title;
        siteDetailsUrl.textContent = userAddress;

        /* get the divs */
		var root = scrape.getElementsByTagName('body')[0];
		var rootNode = mapWithRoot(graph,root);

		sigmaInstance.on("enterNode", ({ node }) => {
			var attrTable = graph.getNodeAttributes(node);
			htmlReadout.textContent = attrTable['divTag'];
			htmlReadout.style.display = 'block';
		});

		sigmaInstance.on("leaveNode", ({ node }) => {
			htmlReadout.textContent = '';
			htmlReadout.style.display = 'none';
		});

		searchingSpinner.style.display = 'none';
		goTag.style.display = 'inline';

		colorizeNodes(graph);
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);
        siteNameElem.textContent = '[Error fetching page]';
        siteDetailsUrl.textContent = url;

        searchingSpinner.style.display = 'none';
		goTag.style.display = 'inline';  
    });
}

/* page setup */

var pageOverview = document.getElementById('arborist-full-container');
pageOverview.style.height = numToStyle(window.innerHeight,'px');

/* create the graph */
const graph = new graphology.Graph();
var graphContainer = document.getElementById('main-tree-container');

var sigmaInstance = new Sigma(graph, graphContainer);

const htmlReadout = document.getElementById('primary-html-readout');

const siteNameElem = document.getElementById('site-details-name');
const siteDetailsUrl = document.getElementById('site-details-url');

const goTag = document.getElementById('input-go');
const searchingSpinner = document.getElementById('searching-spinner');

const triggerButton = document.getElementById('url-submit-button');
const urlField = document.getElementById('url-entry-field');

const legendContainer = document.getElementById('primary-legend');

triggerButton.onclick = function() {
	var searchTerm = urlField.value;
	urlField.value = '';
	updateTree(searchTerm);
}

// Execute a function when the user presses a key on the keyboard
urlField.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    triggerButton.click();
  }
});

/* demo setup */
const demoUrl = 'rvest.tidyverse.org';

updateTree(demoUrl);




