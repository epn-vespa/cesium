/*global define*/
define([
        '../../Core/defineProperties',
        '../../ThirdParty/knockout',
        './ToolsViewModel'
    ], function(
        defineProperties,
        knockout,
        ToolsViewModel) {
    'use strict';

    var icone = '<path d="M951.315 388.647c13.75 13.75 13.75 35 0 50l-67.5 68.75c-13.75 13.75 -35 13.75 -50 0l-15 -16.25c-11.25 -10 -16.25 -28.75 -10 -37.5 11.25 -7.5 7.5\
                -30 -13.75 -50 -30 -31.25 -68.75 -32.5 -83.75 -16.25 -6.25 5 -26.25 26.25 -26.25 26.25l-92.5 -91.25 15 -15s3.75 -3.75 11.25 -12.5c28.75 -28.75 -1.25 -61.25 \
                        -1.25 -61.25 -81.25 -80 -195 -78.75 -195 -78.75l-1.25 -28.75c228.75 -58.75 315 41.25 346.25 72.5l66.25 66.25c16.25 16.25 0 62.5 23.75 88.75 11.25 11.25\
                26.25 16.25 37.5 16.25 12.5 -11.25 32.5 -7.5 42.5 3.75zm-406.25 168.75l220 197.5c31.25 31.25 30 81.25 -1.25 113.75 -32.5 31.25 -82.5 31.25 -113.75 -1.25l-201.25\
                        -212.5 -187.5 226.25c-17.5 18.75 -48.75 18.75 -67.5 0l-48.75 -50c-18.75 -17.5 -18.75 -48.75 0 -67.5l215 -200 -103.75 -100c-33.75 -32.5 -53.75 -42.5 -81.25\
                        -33.75 -27.5 10 -66.25 10 -102.5 -13.75 -77.5 -50 -72.5 -143.75 -72.5 -143.75l6.25 -10s70 45 78.75 50c11.25 8.75 50 26.25 85 -27.5 36.25 -53.75 6.25 -87.5\
                        -3.75 -93.75 -8.75 -5 -78.75 -51.25 -78.75 -51.25l6.25 -10s81.25 -41.25 157.5 3.75c0 2.5 18.75 13.75 26.25 20 48.75 43.75 48.75 92.5 40 132.5 -7.5 36.25\
                0 48.75 28.75 80l103.75 103.75 123.75 -126.25 90 92.5zm191.25 283.75c16.25 -15 16.25 -43.75 0 -60s-42.5 -16.25 -60 0c-15 16.25 -15 43.75 0 58.75 17.5 16.25 43.75 \
                18.75 60 1.25z"</svg>';



    /**
     * A widget for permforming some modifications.
     *
     * @alias Tools
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {Element|String} wrapper.
     * @param {Object} Viewer.
     */
    var Tools = function (container, wrapper, viewer) {

        var viewModel = new ToolsViewModel(container, wrapper, viewer);

        viewModel._icone = icone;
        this._viewModel = viewModel;

        var toolButton = document.createElement('div');
        toolButton.className = 'cesium-button cesium-toolbar-button';
        toolButton.innerHTML = '<svg width="30" height="30" viewBox="-80 50 1100 900">' + icone + ' </svg>';
        toolButton.setAttribute('data-bind', 'attr: { title: "tools" },  event : {mousedown : moveIconCommand, click:showToolPanel}');
        wrapper.appendChild(toolButton);

        knockout.applyBindings(viewModel, toolButton);


    };

    defineProperties(Tools.prototype, {
        /**
         * Gets the parent container.
         * @memberof Tools.prototype
         *
         * @type {Element}
         */
        container: {
            get: function () {
                return this._container;
            }
        },
        /**
         * Gets the view model.
         * @memberof Tools.prototype
         *
         * @type {ToolsViewModel}
         */
        viewModel: {
            get: function () {
                return this._viewModel;
            }
        },
    });

    return Tools;
});
