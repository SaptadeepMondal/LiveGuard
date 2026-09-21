import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useEventStore } from '../store/useEventStore';
import { HONEYPOT_COORDS } from './BaseMap';

export const LiveArcs: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { activeEvents, removeEvent, muted } = useEventStore();

  const playBlip = (isRed: boolean) => {
    if (muted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = isRed ? 220 : 340;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

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

        const isRed = event.event_type === "DDoS";
        const isAmber = event.event_type === "Intruders";
        const strokeColor = isRed ? "var(--color-red)" : isAmber ? "var(--color-amber)" : "var(--color-cyan)";

        if (pathData) {
          const path = svg.append("path")
            .attr("id", elementId)
            .attr("class", "map-arc")
            .attr("d", pathData)
            .attr("stroke", strokeColor);

          // Get path length for animation
          const totalLength = (path.node() as SVGPathElement).getTotalLength();

          // Animate
          path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(850)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0)
            .on("end", () => {
              playBlip(isRed);
              // Impact burst
              const [hx, hy] = destCoords;
              const [sx, sy] = projection([hx, hy]) || [0,0];
              const burst = svg.append("circle")
                .attr("cx", sx).attr("cy", sy).attr("r", 2)
                .attr("fill", "none").attr("stroke", strokeColor).attr("stroke-width", 2);
              burst.transition().duration(400).attr("r", 20).style("opacity", 0).on("end", () => burst.remove());
              
              path.transition()
                .duration(300)
                .style("opacity", 0)
                .on("end", () => {
                  path.remove();
                  removeEvent(event.id);
                });
            });
            
          // Draw Source Marker briefly
          const [sx, sy] = projection(sourceCoords) || [0, 0];
          
          // Origin ping ring
          const ring = svg.append("circle")
            .attr("cx", sx).attr("cy", sy).attr("r", 2)
            .attr("fill", "none").attr("stroke", strokeColor).attr("stroke-width", 1);
          ring.transition().duration(600).attr("r", 15).style("opacity", 0).on("end", () => ring.remove());
          
          const circle = svg.append("circle")
            .attr("cx", sx)
            .attr("cy", sy)
            .attr("r", 2)
            .attr("fill", strokeColor);
            
          circle.transition()
            .duration(850)
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
