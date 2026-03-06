// Load results when page loads
window.addEventListener('DOMContentLoaded', loadResults);

function loadResults() {
    fetch('/api/results')
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            updateStats(data);
            createReportedChart(data);
            createTrueChart(data);
            updateExplanations(data);
        })
        .catch(error => {
            console.error('Error loading results:', error);
            alert('Error loading results. Make sure you have submitted some responses!');
        });
}

function updateStats(data) {
    // Animate numbers counting up
    animateNumber('total-participants', data.total);

    // Calculate heads and tails
    const headsCount = data.true_total || 0;
    const tailsCount = data.total - headsCount;

    animateNumber('heads-count', headsCount);
    animateNumber('tails-count', tailsCount);
}

function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = targetNumber / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            element.textContent = Math.round(targetNumber);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, duration / steps);
}

function createReportedChart(data) {
    // Clear existing chart
    d3.select('#reported-chart').selectAll('*').remove();

    const chartData = [
        { label: 'YES', value: data.yes_percentage, count: Math.round(data.total * data.yes_percentage / 100) },
        { label: 'NO', value: data.no_percentage, count: Math.round(data.total * data.no_percentage / 100) }
    ];

    createBarChart('#reported-chart', chartData);

    // Update percentages
    document.getElementById('reported-yes').textContent = Math.round(data.yes_percentage) + '%';
    document.getElementById('reported-no').textContent = Math.round(data.no_percentage) + '%';
}

function createTrueChart(data) {
    // Clear existing chart
    d3.select('#true-chart').selectAll('*').remove();

    const total = data.true_yes + data.true_no;
    const yesPercent = total > 0 ? (data.true_yes / total * 100) : 0;
    const noPercent = total > 0 ? (data.true_no / total * 100) : 0;

    const chartData = [
        { label: 'YES', value: yesPercent, count: data.true_yes },
        { label: 'NO', value: noPercent, count: data.true_no }
    ];

    createBarChart('#true-chart', chartData);

    // Update percentages
    document.getElementById('true-yes').textContent = Math.round(yesPercent) + '%';
    document.getElementById('true-no').textContent = Math.round(noPercent) + '%';
}

function createBarChart(selector, data) {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.3);

    // Y scale
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
        .domain(['YES', 'NO'])
        .range(['#28a745', '#dc3545']);

    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => color(d.label))
        .attr('opacity', 0.8)
        .transition()
        .duration(1000)
        .attr('y', d => y(d.value))
        .attr('height', d => height - y(d.value));

    // Add value labels on bars
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.label) + x.bandwidth() / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(d => `${Math.round(d.value)}%`)
        .transition()
        .duration(1000)
        .attr('y', d => y(d.value) + 20);

    // Add count labels
    svg.selectAll('.count')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'count')
        .attr('x', d => x(d.label) + x.bandwidth() / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text(d => `(${d.count})`)
        .transition()
        .duration(1000)
        .attr('y', d => y(d.value) + 35);

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .style('font-size', '14px')
        .style('font-weight', 'bold');

    // Y axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
        .style('font-size', '12px');
}

function updateExplanations(data) {
    document.getElementById('explain-total').textContent = data.total;
    document.getElementById('explain-yes').textContent = Math.round(data.total * data.yes_percentage / 100);
    document.getElementById('explain-no').textContent = Math.round(data.total * data.no_percentage / 100);
    document.getElementById('explain-heads').textContent = data.true_total;
    document.getElementById('explain-true-yes').textContent = data.true_yes;
    document.getElementById('explain-true-no').textContent = data.true_no;
}