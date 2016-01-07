/*global define*/
define([
        '../../Core/Color',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/destroyObject',
        '../../Core/DeveloperError',
        '../../ThirdParty/knockout',
        '../getElement',
	    '../../Core/ScreenSpaceEventHandler',
        '../../Core/ScreenSpaceEventType',
		'./ToolsViewModel'
    ], function(
        Color,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        knockout,
        getElement,
		ScreenSpaceEventHandler,
		ScreenSpaceEventType,
		ToolsViewModel) {
    "use strict";


		var icone = '<g><path d="M277.739,386.902l-18.075-10.439c1.22-6.639,1.942-13.422,1.942-20.396s-0.723-13.742-1.942-20.383l18.058-10.422\
		c3.849-2.215,6.639-5.871,7.796-10.154c1.152-4.281,0.545-8.85-1.67-12.686l-21.169-36.672\
		c-4.617-8.002-14.847-10.742-22.849-6.125l-18.013,10.406c-10.358-8.787-22.32-15.717-35.372-20.381v-20.867\
		c0-9.234-7.475-16.721-16.713-16.721h-42.352c-9.221,0-16.727,7.486-16.727,16.721v20.867\
		c-13.052,4.664-24.982,11.594-35.342,20.381L57.27,259.625c-8.002-4.617-18.218-1.877-22.835,6.125l-21.17,36.66\
		c-4.616,8-1.875,18.217,6.113,22.834l18.057,10.439c-1.187,6.641-1.924,13.408-1.924,20.383s0.737,13.773,1.924,20.416\
		L19.378,386.92c-7.988,4.617-10.729,14.834-6.113,22.834l21.152,36.66c2.232,3.836,5.871,6.639,10.167,7.795\
		c4.282,1.139,8.854,0.547,12.686-1.682L75.345,442.1c10.327,8.789,22.271,15.719,35.31,20.367v20.865\
		c0,9.234,7.506,16.727,16.727,16.727h42.352c9.238,0,16.713-7.492,16.713-16.727v-20.865c13.052-4.648,25.014-11.578,35.342-20.367\
		l18.057,10.428c7.988,4.617,18.218,1.875,22.835-6.113l21.169-36.66C288.464,401.754,285.741,391.523,277.739,386.902z\
		 M148.567,427.188c-39.213,0-71.107-31.914-71.107-71.121s31.895-71.121,71.107-71.121c39.222,0,71.121,31.914,71.121,71.121\
		S187.789,427.188,148.567,427.188z"/>\
	<path d="M148.567,301.365c-30.148,0-54.685,24.535-54.685,54.701c0,30.162,24.536,54.697,54.685,54.697\
		c30.162,0,54.698-24.535,54.698-54.697C203.266,325.9,178.729,301.365,148.567,301.365z"/>\
	<path d="M482.555,314.822c-16.504-17.771-40.075-24.969-62.334-21.379L238.415,97.688c5.215-21.918-0.205-45.959-16.69-63.695\
		c-14.579-15.682-34.641-22.98-54.462-21.955c-2.599,0.129-4.906,1.764-5.867,4.188c-0.995,2.422-0.481,5.193,1.282,7.119\
		l19.164,20.623c1.715,1.859,2.644,4.314,2.55,6.846c-0.099,2.537-1.188,4.906-3.05,6.639l-35.533,32.988\
		c-3.85,3.578-9.882,3.354-13.472-0.494L113.19,69.32c-1.8-1.926-4.523-2.629-7.01-1.826c-2.483,0.799-4.282,2.982-4.6,5.576\
		c-2.474,19.68,3.269,40.205,17.86,55.891c16.485,17.734,40.043,24.934,62.302,21.344l181.838,195.768\
		c-5.229,21.943,0.192,45.979,16.695,63.764c14.561,15.637,34.604,22.9,54.425,21.887c2.612-0.123,4.891-1.727,5.886-4.164\
		c0.995-2.426,0.482-5.215-1.313-7.141l-19.133-20.607c-3.577-3.83-3.386-9.908,0.495-13.502l35.507-32.971\
		c3.88-3.59,9.895-3.365,13.502,0.5l19.147,20.621c1.795,1.924,4.522,2.648,7.005,1.844c2.475-0.83,4.27-2.996,4.622-5.576\
		C502.902,351.049,497.115,330.504,482.555,314.822z"/>\</g>';


    /**
     * A widget for permforming some modifications.
     *
     * @alias Tools
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Object} Viewer.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     */
    var Tools = function(container, wrapper, viewer) {                                                   
		
		var viewModel  = new ToolsViewModel(container, wrapper, viewer);	
		
		viewModel._icone = icone;
		this._viewModel = viewModel;
		
		var toolButton           = document.createElement('div');                              
        toolButton.className     = 'cesium-button cesium-toolbar-button';                                                       
        toolButton.innerHTML = '<svg width="25" height="25" viewBox="-30 -30 512 512">'+icone+' </svg>';             
        toolButton.setAttribute('data-bind', 'attr: { title: "tools" },  event : {mousedown : moveIconCommand, click:showToolPanel}');
	    wrapper.appendChild(toolButton); 
		
     

       knockout.applyBindings(viewModel, wrapper);


    };

    defineProperties(Tools.prototype, {
        /**
         * Gets the parent container.
         * @memberof Tools.prototype
         *
         * @type {Element}
         */
        container : {
            get : function() {
                return this._container;
            }
        },

        /**
         * Gets the view model.
         * @memberof Tools.prototype
         *
         * @type {ToolsViewModel}
         */
        viewModel : {
            get : function() {
                return this._viewModel;
            }
        },
    });

    return Tools;
});