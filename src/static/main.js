function moving_averages(nums, window_size = 10) {
    let window = [];
    let averages = [];
    let sum = 0; 
    for (const num of nums) {
        window.push(num);
        sum = sum + num;
        if (window.length < window_size) continue;
        averages.push(sum / window_size);
        sum -= window.shift();
    }
    return averages;
}

function average_score_chart(json) {
    let svg_width = 800, svg_height = 600,
        margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = svg_width - margin.left - margin.right,
        height = svg_height - margin.top - margin.bottom;

    let x = d3.scaleLinear()
        .range([0, width]);
    let y = d3.scaleLinear()
        .range([height, 0]);

    let svg = d3.select("#charts").append("svg")
            .attr("width", svg_width)
            .attr("height", svg_height)
        .append("g");

    svg.append("g")
        .attr("transform", "translate(" + margin.left + 
                                      ", " + (height + margin.top) + ")")
        .attr("class", "xAxis axis");

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .attr("class", "yAxis axis");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", svg_width / 2)
        .attr("y", height + margin.top + 40)
        .attr("class", "axis")
        .text("Game");

    let y_label = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", -svg_height / 2)
        .attr("y", "0.8em")
        .attr("class", "axis")
        .attr("transform", "rotate(-90)");

    let tooltip = d3.select("main")
        .append("div")
        .attr("class", "tooltip");

    let mouseover = d => tooltip.style("display", "block");
    let mousemove = (ev, data) => {
        tooltip.html(data)
            .style("left", (ev.clientX + 10) + "px")
            .style("top", (ev.clientY - 5) + "px");
    };
    let mouseleave = d => tooltip.style("display", "none");

    const transition_ms = 50;
    const plot = data => {
        x.domain([0, data.length - 1])
        y_label.text("Average score (window size = " 
            + document.getElementById("windowSlider").value
            + ")");

        let with_pad = [d3.min(data) - 1, d3.max(data) + 1];
        y.domain(with_pad)

        svg.selectAll(".xAxis")
            .transition()
            .duration(transition_ms)
            .call(d3.axisBottom(x));
        svg.selectAll(".yAxis")
            .transition()
            .duration(transition_ms)
            .call(d3.axisLeft(y));

        let line = svg.selectAll(".line")
            .data([data]);
        line.enter()
            .append("path")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .attr("class", "line")
            .merge(line)
            .transition()
            .duration(transition_ms)
            .attr("d", d3.line()
                .x((_, i) => x(i))
                .y(s => y(s))
                .curve(d3.curveMonotoneX))
            .attr("transform", "translate(" + margin.left + 
                                          ", " + margin.top + ")")
    };
    const scores = json.map(game => parseInt(game.score));
    const do_plot = () => {
        plot(moving_averages(
            scores,
            document.getElementById("windowSlider").value));
    };
    document.getElementById("windowSlider")
        .addEventListener("input", do_plot);
    do_plot();
}

function populate_charts(json) {
    average_score_chart(json);
}

function build_row(game_data) {
    let row = document.createElement("tr");
    for (const [k, v] of Object.entries(game_data)) {
        let cell = document.createElement("td");
        cell.innerHTML = v;
        row.appendChild(cell);
    }
    return row;
}

function populate_data_table(games) {
    let table = document.getElementById("dataTable");

    if (games.length == 0) {
        table.innerHTML = "No games played";
        return
    }

    let header = document.createElement("tr");
    for (const k of Object.keys(games[0])) {
        let cell = document.createElement("th");
        cell.innerHTML = k;
        header.appendChild(cell);
    }
    const rows = games.map(build_row);
    table.replaceChildren(header, ...rows);
}

function populate_page(json) {
    populate_data_table(json);
    populate_charts(json);
}

function json_or_throw_status(res) {
    if (res.ok) return res.json();
    throw res.status;
}

function load_games() {
    let data = fetch('/api/games', { method: 'GET' })
        .then(res => json_or_throw_status(res))
        .then(json => populate_page(json))
        .catch(err => console.log('Error loading games', err));
}

setTimeout(() => {
    let container = document.getElementById("dataTable");
    if (!container.innerHTML) {
        container.innerHTML = "Loading...";
    }}, 200);
window.onload = load_games
