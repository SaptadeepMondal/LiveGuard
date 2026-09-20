import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useEventStore } from '../store/useEventStore';
import { HONEYPOT_COORDS } from './BaseMap';

export const LiveArcs: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { activeEvents, removeEvent } = useEventStore();

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    // We assume the map is full-screen and matches BaseMap's projection logic
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const projection = d3.geoMercator()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 1.5]);

    activeEvents.forEach(event => {
      // Create a unique ID for this arc in the DOM
      const elementId = `arc-${event.id}`;
      if (svg.select(`#${elementId}`).empty()) {
        const sourceCoords: [number, number] = [event.src_lon, event.src_lat];
        const destCoords = HONEYPOT_COORDS;

        // Calculate path using geoPath
        const pathData = d3.geoPath().projection(projection)({
          type: "LineString",
          coordinates: [sourceCoords, destCoords]
        });

        if (pathData) {
          const path = svg.append("path")
            .attr("id", elementId)
            .attr("class", "map-arc")
            .attr("d", pathData);

          // Get path length for animation
          const totalLength = (path.node() as SVGPathElement).getTotalLength();

          // Animate
          path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1500)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0)
            .transition()
            .duration(500)
            .style("opacity", 0)
            .on("end", () => {
              path.remove();
              removeEvent(event.id);
            });
            
          // Draw Source Marker briefly
          const [sx, sy] = projection(sourceCoords) || [0, 0];
          const circle = svg.append("circle")
            .attr("cx", sx)
            .attr("cy", sy)
            .attr("r", 2)
            .attr("fill", "#ef4444"); // Red
            
          circle.transition()
            .duration(2000)
            .style("opacity", 0)
            .on("end", () => circle.remove());
        }
      }
    });
    
    // Handle resize (to keep SVG dimensions matching window)
    const handleResize = () => {
        svg.attr('width', window.innerWidth).attr('height', window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [activeEvents, removeEvent]);

  return (
    <svg 
      ref={svgRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};
