function nicenumber(value)
{
    if(value < 10)
    {
        return value.toFixed(1);
    }

    var valueText = value.toFixed(0);
    
    while(valueText.match(/\d{4}\b/))
    {
        valueText = valueText.replace(/^(\d+)(\d{3}\b.*)$/, '$1,$2');
    }
    
    return valueText;
}

function niceinteger(value)
{
    if(value < 10)
    {
        return value.toFixed(0);
    }
    
    return nicenumber(value);
}

function append_labeled_pie_chart(element, data, header, labels, colors, darks, small)
{
    for(var i = data.length - 1; i >= 0; i--)
    {
        if(data[i] == 0)
        {
            data.splice(i, 1);
            labels.splice(i, 1);
            colors.splice(i, 1);
            darks.splice(i, 1);
        }
    }

    var hh = document.createElement('h5')
    hh.appendChild(document.createTextNode(header[1]));
    element.appendChild(hh);

    var chart = document.createElement('div');
    element.appendChild(chart);

    var vis = new pv.Panel()
        .canvas(chart)
        .def('active', -1)
        .width(150)
        .height(small ? 100 : 150);
    
    var external_labels = [];
    
    function addExternalLabel(element, index)
    {
        if(external_labels[index] != undefined)
            return external_labels[index];
    
        function on()
        {
            vis.active(index);
            vis.root.render();
            
            $(element).addClass('active');
        }
        
        function off()
        {
            vis.active(-1);
            vis.root.render();
            
            $(element).removeClass('active');
        }
        
        external_labels[index] = {'on': on, 'off': off};
        
        element.onmouseover = function(e)
        {
            on();
        }

        element.onmouseout = function(e)
        {
            off();
        }
        
        return external_labels[index];
    }
    
    var sum = pv.sum(data);

    var wedge = vis.add(pv.Wedge)
        .data(data)
        .left(75)
        .bottom(small ? 50 : 75)
        .innerRadius(small ? 20 : 35)
        .outerRadius(small ? 50 : 75)
        .angle(function(d) { return d / sum * 2 * Math.PI })
        .fillStyle(function(d) { return colors[this.index] })
        .strokeStyle('white')
        .lineWidth(1)
        .event('mouseover', function() { return external_labels[this.index].on(); })
        .event('mouseout', function() { return external_labels[this.index].off(); });
    
    wedge.anchor()
        .add(pv.Label)
        .visible(function(d) { return this.index == vis.active() })
        .textStyle(function(d) { return darks[this.index] ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.6)' })
        .font('16px Helvetica, Arial')
        .text('●');

    vis.render();
    
    var ti = document.createElement('h4')
    ti.appendChild(document.createTextNode(header[0]));
    ti.appendChild(document.createElement('br'));
    ti.appendChild(document.createTextNode(header[1]));
    element.appendChild(ti);
    
    var ol = document.createElement('ol');
    
    for(var i = 0 ; i < data.length; i += 1)
    {
        var bl = document.createTextNode('█');
        var co = document.createElement('span');
        var tx = document.createTextNode(labels[i]);
        var li = document.createElement('li');
        
        addExternalLabel(li, i);
        
        co.style.color = colors[i];
        co.style.paddingRight = '0.5em';
        
        co.appendChild(bl);
        li.appendChild(co);
        li.appendChild(tx);
        ol.appendChild(li);
    }
    
    element.appendChild(ol);
}

function dodemographics(id, area_name, demographics)
{
    var population = demographics[0][0];
    var housing = demographics[1][0];
    
    $([id, '.population-number'].join(' ')).text(niceinteger(population));
    $([id, '.housing-number'].join(' ')).text(niceinteger(housing));
    
    function raceChart()
    {
        var counts = [], labels = [];
        
        for(var i = 2; i <= 8; i += 1)
        {
            var count = demographics[i][0];
            counts.push(count);
            labels.push(nicenumber(100 * count / population) + '% ' + demographics[i][1]);
        }

        var chart = document.createElement('div');
        chart.className = 'labeled-pie-chart';
        
        append_labeled_pie_chart(chart, counts, ['Race', area_name], labels, ['#9c9ede', '#7375b5', '#4a5584', '#cedb9c', '#b5cf6b', '#8ca252', '#637939'], [0, 1, 1, 0, 0, 0, 1], false);
        
        return chart;
    }
    
    function genderChart()
    {
        var counts = [
                      (100 * demographics[9][0] / population),
                      (100 * demographics[33][0] / population)
                     ];
        
        var labels = [counts[0].toFixed(1) + '% Male', counts[1].toFixed(1) + '% Female'];

        var chart = document.createElement('div');
        chart.className = 'labeled-pie-chart';
        
        append_labeled_pie_chart(chart, counts, ['Gender', area_name], labels, ['#c2e699', '#31a354'], [0, 1], true);
        
        return chart;
    }
    
    function groupBlocks(blocks, demographics, total)
    {
        var counts = [], labels = [];
        
        for(var i = 0; i < blocks.length; i += 1)
        {
            var label = blocks[i][0], count = 0;
            
            for(var j = blocks[i][1]; j <= blocks[i][2]; j += 1)
            {
                count += demographics[j][0];
            }
            
            if(blocks[i].length >= 5)
            {
                for(var j = blocks[i][3]; j <= blocks[i][4]; j += 1)
                {
                    count += demographics[j][0];
                }
            }
            
            counts.push(count);
            labels.push(nicenumber(100 * count / total) + '% ' + label);
        }
        
        return [counts, labels];
    }
    
    function ageChart()
    {
        var blocks = [['Under 18', 10, 13, 34, 37],
                      ['Age 18 to 29', 14, 18, 38, 42],
                      ['Age 30 to 44', 19, 21, 43, 45],
                      ['Age 45 to 64', 22, 26, 46, 50],
                      ['Age 65 and up', 27, 32, 51, 56]];
        
        var counts_labels = groupBlocks(blocks, demographics, population);
        var counts = counts_labels[0], labels = counts_labels[1];
        
        var chart = document.createElement('div');
        chart.className = 'labeled-pie-chart';
        
        append_labeled_pie_chart(chart, counts, ['Age', area_name], labels, ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'], [0, 0, 0, 1, 1], false);
        
        return chart;
    }
    
    function housingChart()
    {
        var blocks = [['One person', 65, 65],
                      ['Two person', 58, 58, 66, 66],
                      ['Three person', 59, 59, 67, 67],
                      ['4 and 5 person', 60, 61, 68, 69],
                      ['6 and more person', 62, 63, 70, 71]];
        
        var counts_labels = groupBlocks(blocks, demographics, housing);
        var counts = counts_labels[0], labels = counts_labels[1];
        
        var chart = document.createElement('div');
        chart.className = 'labeled-pie-chart';
        
        append_labeled_pie_chart(chart, counts, ['Households', area_name], labels, ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'], [0, 0, 0, 1, 1], false);
        
        return chart;
    }

    function educationChart()
    {
        var blocks = [['No high school', 90, 93, 107, 110],
                      ['Attended high school', 94, 97, 111, 114],
                      ['Finished high school', 98, 98, 115, 115],
                      ['Attended college', 99, 100, 116, 117],
                      ['College degree', 101, 102, 118, 119],
                      ['College+', 103, 105, 120, 122]];
        
        var population = demographics[89][0] + demographics[106][0];
        var counts_labels = groupBlocks(blocks, demographics, population);
        var counts = counts_labels[0], labels = counts_labels[1];
        
        var chart = document.createElement('div');
        chart.className = 'labeled-pie-chart';
        
        append_labeled_pie_chart(chart, counts, ['Education (age 25+ only)', area_name], labels, ['#f1eef7', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'], [0, 0, 0, 0, 1, 1], false);
        
        return chart;
    }
    
    function incomeChart()
    {
        var blocks = [['Under $10k', 124, 124],
                      ['$10k-$30k', 125, 128],
                      ['$30k-$60k', 129, 133],
                      ['$60k-$100k', 134, 135],
                      ['$100k-$200k', 136, 138],
                      ['$200k+', 139, 139]];
        
        var households = demographics[123][0];
        var counts_labels = groupBlocks(blocks, demographics, households);
        var counts = counts_labels[0], labels = counts_labels[1];
        
        var chart = document.createElement('div');
        chart.className = 'labeled-pie-chart';
        
        append_labeled_pie_chart(chart, counts, ['Income (by household)', area_name], labels, ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'], [0, 0, 0, 0, 1, 1], false);
        
        return chart;
    }

    $([id, '.race.chart'].join(' ')).empty().append(raceChart());
    $([id, '.gender.chart'].join(' ')).empty().append(genderChart());
    $([id, '.age.chart'].join(' ')).empty().append(ageChart());
    $([id, '.housing.chart'].join(' ')).empty().append(housingChart());
    $([id, '.education.chart'].join(' ')).empty().append(educationChart());
    $([id, '.income.chart'].join(' ')).empty().append(incomeChart());
}

function paintbullseye(ctx, x, y)
{
    ctx.fillStyle = 'rgba(0, 0, 0, .1)';

    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI*2, false);
    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgba(49, 163, 84, 1)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI*2, false);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#000';

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI*2, false);
    ctx.closePath();

    ctx.fill();
}

/**
 * For a geometry return a list of rings in mm.Location form, normalized so
 * that exterior rings go clockwise and interior rings go counter-clockwise.
 * This lets us take advantage of the non-zero winding number rule for fills.
 */
function normalize_rings(geometry)
{
    var mm = com.modestmaps,
        geoms = (geometry.type == 'MultiPolygon') ? geometry.coordinates : [geometry.coordinates],
        rings = [];
    
    for(var i = 0; i < geoms.length; i++)
    {
        for(var j = 0; j < geoms[i].length; j++)
        {
            var spin = 0,
                r180 = Math.PI,
                r360 = Math.PI * 2,
                exterior = (j == 0),
                src_ring = geoms[i][j],
                dst_ring = [];
            
            for(var k = 0; k < src_ring.length; k++)
            {
                var l = (k + 1) % src_ring.length,
                    m = (k + 2) % src_ring.length;
                
                var p1 = src_ring[k],
                    p2 = src_ring[l],
                    p3 = src_ring[m];
                
                var t1 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]),
                    t2 = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);

                var theta = (t2 - t1);
                
                if(theta > r180) {
                    theta -= r360;

                } else if(theta < -r180) {
                    theta += r360;
                }
                
                spin += theta;
                dst_ring.push(new mm.Location(p1[1], p1[0]));
            }
            
            var direction = (Math.abs(spin + r360) < 0.00001) ? 'ccw' : 'cc';
            
            // reverse the ring direction so that exteriors go clockwise
            if(exterior && direction != 'cc' || !exterior && direction != 'ccw')
            {
                dst_ring.reverse();
            }
            
            rings.push(dst_ring);
        }
    }
    
    return rings;
}

function domap(id, geometry, latlon)
{
    var mm = com.modestmaps,
        width = 800, height = 600,
        rings = normalize_rings(geometry);
    
    var locations = rings.reduce(function(a, b) { return a.concat(b) });
    
    $('#' + id).empty();
    
    var template = 'http://otile1.mqcdn.com/tiles/1.0.0/osm/{Z}/{X}/{Y}.png';
    var provider = new mm.TemplatedMapProvider(template);
    var element = document.getElementById(id);
    
    var map = new mm.Map(element, provider, new mm.Point(width, height), []);

    map.setSize(width, height);
    map.setExtent(locations);
    map.draw();
    
    var ymin = height, ymax = 0;
    
   /*
    * Correct map height so that the tract fills it vertically at the current zoom.
    */
    for(var i = 0; i < rings.length; i++)
    {
        for(var j = 0; j < rings[i].length; j++)
        {
            var point = map.locationPoint(rings[i][j]);
            ymin = Math.min(ymin, point.y);
            ymax = Math.max(ymax, point.y);
        }
    }
    
    height = Math.ceil(21 + ymax - ymin);
    map.setSize(width, height);
    
   /*
    * Convert every location in rings array to a point.
    */
    for(var i = 0; i < rings.length; i++)
    {
        for(var j = 0; j < rings[i].length; j++)
        {
            rings[i][j] = map.locationPoint(rings[i][j]);
        }
    }
    
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.width = width;
    canvas.height = height;
    map.parent.appendChild(canvas);
    
    var ctx = canvas.getContext('2d');
    
    if(ctx)
    {
        ctx.clearRect(0, 0, width, height);
        
       /*
        * Draw the white mask
        */
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.lineTo(0, 0);
        
        for(var i = 0; i < rings.length; i++)
        {
            var ring = rings[i],
                start = ring[ring.length - 1];
            
            ctx.moveTo(start.x, start.y);
            
            for(var j = 0; j < ring.length; j++)
            {
                ctx.lineTo(ring[j].x, ring[j].y);
            }
        }

        ctx.closePath();
        ctx.fill();
        
       /*
        * Draw the hairline edge
        */
        ctx.strokeStyle = 'rgba(49, 163, 84, 1)';
        ctx.beginPath();
        
        for(var i = 0; i < rings.length; i++)
        {
            var ring = rings[i],
                start = ring[ring.length - 1];
            
            ctx.moveTo(start.x, start.y);
            
            for(var j = 0; j < ring.length; j++)
            {
                ctx.lineTo(ring[j].x, ring[j].y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
    }
    
    var location = new mm.Location(latlon[0], latlon[1]);
    var point = map.locationPoint(location);
    
    paintbullseye(ctx, point.x, point.y);
}

function donavmap(id, latlon)
{
    var width = 700, height = 250, mm = com.modestmaps;
    
    $('#' + id).empty();
    
    var template = 'http://otile1.mqcdn.com/tiles/1.0.0/osm/{Z}/{X}/{Y}.png';
    var provider = new mm.TemplatedMapProvider(template);
    var element = document.getElementById(id);
    
    var map = new mm.Map(element, provider, new mm.Point(width, height));

    map.setSize(width, height);
    map.setCenterZoom(new mm.Location(latlon[0], latlon[1]), 12);
    map.draw();
    
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.width = width;
    canvas.height = height;
    map.parent.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    
    paintbullseye(ctx, canvas.width/2, canvas.height/2);
    
    return map;
}

function togglenavmap(element)
{
    var container = $('#nav-map-container');
    
    if(container.hasClass('off')) {
        $(element).text('Hide Map');
        container.removeClass('off');

    } else {
        $(element).text('Show Map');
        container.addClass('off');
    }
    
    return false;
}

function tractfinder()
{
    var navmap = undefined,
        latitude = undefined,
        longitude = undefined;

    function navmapzoomin()
    {
        if(navmap)
        {
            navmap.zoomIn();
        }
        
        return false;
    }

    function navmapzoomout()
    {
        if(navmap)
        {
            navmap.zoomOut();
        }
        
        return false;
    }
    
    function onlocation(o)
    {
        //console.log(o);
        
        latitude = parseFloat(o.place.centroid.latitude);
        longitude = parseFloat(o.place.centroid.longitude);
        
        window['onblock'] = onblock;

        var url = ['http://data.fcc.gov/api/block/2000/find',
                   '?format=jsonp',
                   '&latitude=', latitude.toFixed(7),
                   '&longitude=', longitude.toFixed(7),
                   '&callback=?'];

        $('#tract').addClass('loading');
        $('#county').addClass('loading');
        $('#state').addClass('loading');

        $.ajax({
            dataType: 'jsonp',
            url: url.join(''),
            success: onblock
        });
        
        if(navmap == undefined)
        {
            navmap = donavmap('nav-map', [latitude, longitude]);

            var onmoved = getonmoved(navmap);
            //navmap.addCallback('zoomed', onmoved);
            navmap.addCallback('panned', onmoved);
            
            $('#navmap-toggle').removeClass('hidden');
        }
    }

    function onblock(o)
    {
        //console.log(['block', o]);
        
        if(!o.Block.FIPS.match(/^(\d{2})(\d{3})(\d{6})(\d{4})/))
        {
            //console.log([o.Block.FIPS, '?!']);
            return;
        }
        
        $('#block .name').text('Block ' + o.Block.FIPS.replace(/^(\d{2})(\d{3})(\d{6})(\d{4})$/, '$1.$2.$3.$4'));

        var tract = o.Block.FIPS.replace(/^(\d{2})(\d{3})(\d{6}).+$/, 'http://this-tract.s3.amazonaws.com/2000/tracts/$1/$2/$3.json');
        var county = o.Block.FIPS.replace(/^(\d{2})(\d{3}).+$/, 'http://this-tract.s3.amazonaws.com/2000/counties/$1/$2.json');
        var state = o.Block.FIPS.replace(/^(\d{2}).+$/, 'http://this-tract.s3.amazonaws.com/2000/states/$1.json');
        var country = 'http://this-tract.s3.amazonaws.com/2000/country.json';
        
        $.ajax({
            dataType: 'jsonp',
            url: 'slimjim.php?url=' + escape(tract) + '&callback=?',
            success: ontract
        });
        
        $.ajax({
            dataType: 'jsonp',
            url: 'slimjim.php?url=' + escape(county) + '&callback=?',
            success: oncounty
        });
        
        $.ajax({
            dataType: 'jsonp',
            url: 'slimjim.php?url=' + escape(state) + '&callback=?',
            success: onstate
        });
        
        $.ajax({
            dataType: 'jsonp',
            url: 'slimjim.php?url=' + escape(country) + '&callback=?',
            success: oncountry
        });
    }

    function ontract(o)
    {
        //console.log(['tract', o]);
        
        $('#tract .name').text(o.Name);
        $('#block .tract-name').text(o.Name);
        $('#tract .landarea-number').html(nicenumber(o.Geography['Land Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        $('#tract .waterarea-number').html(nicenumber(o.Geography['Water Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        
        $('#tract').removeClass('loading');

        dodemographics('#tract', o.Name.replace(/ /g, ' '), o.Demographics);
        domap('tract-map', o.Geography.geometry, [latitude, longitude]);
    }

    function oncounty(o)
    {
        //console.log(['county', o]);
        
        $('#county').removeClass('loading');

        $('#county .name').text(o.Name);
        $('#block .county-name').text(o.Name);
        $('#county .landarea-number').html(nicenumber(o.Geography['Land Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        $('#county .waterarea-number').html(nicenumber(o.Geography['Water Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        
        dodemographics('#county', o.Name.replace(/ /g, ' '), o.Demographics);
    }

    function onstate(o)
    {
        //console.log(['state', o]);
        
        $('#state').removeClass('loading');

        $('#state .name').text(o.Name);
        $('#block .state-name').text(o.Name);
        $('#state .landarea-number').html(nicenumber(o.Geography['Land Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        $('#state .waterarea-number').html(nicenumber(o.Geography['Water Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        
        dodemographics('#state', o.Name.replace(/ /g, ' '), o.Demographics);
    }
    
    function oncountry(o)
    {
        //console.log(['country', o]);
        
        $('#country').removeClass('loading');

        $('#country .name').text(o.Name);
        $('#country .landarea-number').html(nicenumber(o.Geography['Land Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        $('#country .waterarea-number').html(nicenumber(o.Geography['Water Area'] / 1000000) + ' km<sup>2<'+'/sup>');
        
        dodemographics('#country', o.Name.replace(/ /g, ' '), o.Demographics);
    }

    function onLatLonQuery(q)
    {
        q = q.replace(/^\s*(\S.+\S)\s*$/, '$1');
        var latlon = q.split(/[\,\s]+/);
        latlon = [parseFloat(latlon[0]), parseFloat(latlon[1])];
        q = latlon[0].toFixed(6) + ', ' + latlon[1].toFixed(6);
        var loc = {'place': {'centroid': {'latitude': latlon[0], 'longitude': latlon[1]}}};
        onlocation(loc);
        
        return q;
    }
    
    function onPlaceSearch(o)
    {
        //console.log(o);
        
        if(o.results.length)
        {
            var latlon = o.results[0].locations[0].latLng;
            var center = {'latitude': latlon.lat, 'longitude': latlon.lng};
            onlocation({'place': {'centroid': center}});
        }
    }
    
    function onSearchQuery(q)
    {
        var appid = 'Dmjtd|lu612007nq,20=o5-50zah';
        //var appid = unescape('Fmjtd%7Cluu7nu0rn0%2Cag%3Do5-5z1xq');
        
        var url = ['http://www.mapquestapi.com/geocoding/v1/address',
                   '?inFormat=kvp&outFormat=json',
                   '&key=' + escape(appid),
                   '&location=' + escape(q),
                   '&callback=?'];
        
        $.ajax({
            dataType: 'jsonp',
            url: url.join(''),
            success: onPlaceSearch
        });
        
        return q;
    }
    
    function start()
    {
        if(location.hash.match(/^#-?\d+(\.\d+)?,-?\d+(\.\d+)?$/))
        {
            var q = onLatLonQuery(location.hash.substr(1));
            location.href = location.pathname + '?q=' + escape(q);
            
            return;
        }
    
        if(location.search.match(/^\?/))
        {
            var parts = location.search.substr(1).split('&');
            
            for(var i = 0; i < parts.length; i += 1)
            {
                if(parts[i].match(/^q=.+$/))
                {
                    var q = unescape(parts[i].substr(2).replace(/\+/g, '%20'));
                    
                    if(q.match(/^\s*-?\d+(\.\d+)?[\,\s]+-?\d+(\.\d+)?\s*$/)) {
                        q = onLatLonQuery(q);

                    } else {
                        q = onSearchQuery(q);
                    }
                    
                    document.getElementById('location-q').value = q;
                    return;
                }
            }
        }
        
        /*
        var loc = {'place': {'centroid': {'latitude': 40.60274481122281, 'longitude': -75.44689178466797}}}; // testing
        var loc = {'place': {'centroid': {'latitude': 37.804372, 'longitude': -122.270803}}}; // downtown
        var loc = {'place': {'centroid': {'latitude': 37.764863, 'longitude': -122.419313}}}; // 16th & mission
        var loc = {'place': {'centroid': {'latitude': 37.804189, 'longitude': -122.263198}}}; // 17th & jackson
        onlocation(loc);
        */

        yqlgeo.get('visitor', onlocation);
    }
    
    function getonmoved(map)
    {
        var timeout;
        
        function actually()
        {
            //console.log(['center', map.getCenter()]);
            var loc = map.getCenter();
            location.hash = '#' + loc.lat.toFixed(6) + ',' + loc.lon.toFixed(6);
            loc = {'place': {'centroid': {'latitude': loc.lat, 'longitude': loc.lon}}};
            onlocation(loc);
        }
        
        function moved(map)
        {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(actually, 500);
        }
        
        return moved;
    }
    
    return {start: start, navmapzoomin: navmapzoomin, navmapzoomout: navmapzoomout};
}
