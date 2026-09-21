import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export const HONEYPOT_COORDS: [number, number] = [8.6821, 50.1109]; // Frankfurt, Germany

export const BaseMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);

  useEffect(() => {
    fetch('/world-110m.json')
      .then(res => res.json())
      .then(data => {
        setWorldData(topojson.feature(data, data.objects.countries));
      })
      .catch(err => console.error("Could not load map data", err));
  }, []);

  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr('width', width).attr('height', height);
    svg.selectAll("*").remove(); // Clear previous renders

    // Map Projection
    const projection = d3.geoMercator()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 1.5]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw Graticule
    const graticule = d3.geoGraticule10();
    svg.append("path")
      .datum(graticule)
      .attr("class", "grat")
      .attr("d", pathGenerator);

    // Draw Land
    svg.append("g")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("class", "map-land");

    // Draw Honeypot Marker
    const [hx, hy] = projection(HONEYPOT_COORDS) || [0, 0];
    
    svg.append("circle")
      .attr("cx", hx).attr("cy", hy).attr("r", 12)
      .attr("fill", "var(--color-cyan)")
      .attr("class", "marker-pulse");
      
    svg.append("circle")
      .attr("cx", hx).attr("cy", hy).attr("r", 4)
      .attr("fill", "none").attr("stroke", "var(--color-cyan)").attr("stroke-width", 1);
      
    svg.append("circle")
      .attr("cx", hx).attr("cy", hy).attr("r", 1.5)
      .attr("fill", "var(--color-cyan)");

    svg.append("text")
      .attr("x", hx + 16).attr("y", hy + 4)
      .text("HONEYPOT")
      .attr("fill", "var(--color-cyan)")
      .attr("class", "font-mono font-bold")
      .attr("font-size", "10px")
      .attr("letter-spacing", "0.1em");
      
    // Handle resize
    const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        svg.attr('width', w).attr('height', h);
        projection.scale(w / 2 / Math.PI).translate([w / 2, h / 1.5]);
        svg.select('.grat').attr('d', pathGenerator as any);
        svg.selectAll('.map-land').attr('d', pathGenerator as any);
        
        const [nx, ny] = projection(HONEYPOT_COORDS) || [0, 0];
        svg.selectAll('circle').attr('cx', nx).attr('cy', ny);
        svg.select('text').attr('x', nx + 16).attr('y', ny + 4);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [worldData]);

  return (
    <svg 
      ref={svgRef} 
      className="absolute top-0 left-0 w-full h-full z-0" 
      style={{ background: 'transparent' }}
    />
  );
};
