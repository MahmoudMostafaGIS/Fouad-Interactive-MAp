 var map = L.map('map').setView([31.197880396573726, 29.906716346740726], 16); // Set to your preferred center and zoom level
        L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            opacity: 0.8,
            attribution: '',
            maxZoom: 19.5
        }).addTo(map);

        function style(feature) {
            var Number = feature.properties.Number;

            // Default style
            var defaultStyle = {
                opacity: 1,
                fillOpacity: 0.85
            };

            // Style for Number greater than 0
            var positiveStyle = {
                fillColor: '#228B22', // Green color
                weight: 1.3,
                color: 'white' // Border color
            };

            // Style for Number less than 0
            var negativeStyle = {
                fillColor: 'gray', // Red color
                weight: 1,
                color: 'black' // Border color
            };

            // Apply styles based on the value of Number
            if (Number > 0) {
                return { ...defaultStyle, ...positiveStyle };
            } else if (Number < 1) {
                return { ...defaultStyle, ...negativeStyle };
            } else {
                // Default style if Number is not greater than 0 or less than 0
                return defaultStyle;
            }
        }
        // Highlight feature function
        function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({
                fillColor: 'Orange',
                weight: 3,
                color: '#666',
                fillOpacity: 0.8
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }

        function toggleGeoJSONLayer() {
            var checkbox = document.getElementById('geojson-toggle');
            if (checkbox.checked) {
                // Add the GeoJSON layer if checkbox is checked
                geojsonLayer.addTo(map);
                greyLayer.addTo(map);
            } else {
                // Remove the GeoJSON layer if checkbox is unchecked
                map.removeLayer(geojsonLayer);
                map.removeLayer(greyLayer);
            }
        }

        geojsonLayer = null;
        greyLayer = null;

        $.getJSON('Geojson/Buildings.geojson', function (data) {

            // Add text labels for features where a certain property is greater than 0
            geojsonLayer = L.geoJson(data, {
                style: style,
                filter: function (feature, layer) {
                    // Change 'numberProperty' to your specific property name
                    return feature.properties.Number < 1;
                }
            })
            geojsonLayer.addTo(map)
            greyLayer = L.geoJson(null, {
                style: style,
                onEachFeature: onEachFeature,
                filter: function (feature, layer) {
                    // Change 'numberProperty' to your specific property name
                    return feature.properties.Number > 0;
                }
            });
            greyLayer.addData(data);
            greyLayer.addTo(map);
            // Reset highlight
            function resetHighlight(e) {
                geojsonLayer.resetStyle(e.target);
            }

            // Define actions for each feature
            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: highlightFeature // You can add other actions here

                });
                // Check if feature has properties 'Name' and 'Details'
                if (feature.properties && feature.properties.Name_EN && feature.properties.Detials_En && feature.properties.Image) {

                    var popupContent = '<table>\
                    <tr>\
                        <th scope="row" ></th>\
                        <td class="Name">' + feature.properties.Name_EN + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row"></th>\
                        <td  class="Detials">' + feature.properties.Detials_En + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row"></th>\
                        <td  >' + '<img class="Image" src="./images/' + feature.properties.Number + '.jpg" />' + '</td>\
                    </tr>\
                </table>';
                // Add popup to map with content 
                layer.bindPopup(popupContent,{keepInView:'flase',minWidth:'700 px'});
                    
                    // Add tooltip in the center of the polygon using feature bound
                    if (layer instanceof L.Polygon) {
                        var center = layer.getBounds().getCenter();
                        var tooltipContent = document.createElement('div');
                        tooltipContent.innerHTML = feature.properties.Number;
                        layer.bindTooltip(tooltipContent, {
                            permanent: true, // Make the tooltip permanent
                            direction: 'center', // Adjust tooltip direction as needed
                            className: 'leaflet-tooltip-permanent' // Add custom CSS class for styling
                        });
                        map.on('zoomend', function () {
                            var zoomLevel = map.getZoom();
                            // Adjust font size based on zoom level
                            if (zoomLevel >= 17) {
                                tooltipContent.style.fontSize = '14px';

                            } else {
                                tooltipContent.style.fontSize = '10px';
                            }
                        });
                    }
                }
            }
        })
