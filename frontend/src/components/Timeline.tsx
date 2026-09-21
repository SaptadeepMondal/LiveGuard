import { useEventStore } from '../store/useEventStore';

export const Timeline = () => {
  const { stats } = useEventStore();
  
  if (stats.buckets.length === 0) return null;

  const maxCount = Math.max(...stats.buckets.map(b => b.count), 1);
  const threshold = maxCount * 0.66;

  // We want to fill the available space evenly.
  // The buckets contain keys like "14:05" and count.
  return (
    <div className="h-16 flex items-end gap-1 px-6 py-2 border-t border-border bg-panel overflow-hidden w-full col-span-1 lg:col-span-3">
      {stats.buckets.map((bucket, i) => {
        const heightPercent = (bucket.count / maxCount) * 100;
        const isHot = bucket.count >= threshold;
        return (
          <div 
            key={`${bucket.key}-${i}`}
            title={`${bucket.key} - ${bucket.count} events`}
            className={`flex-1 transition-all duration-300 ${isHot ? 'bg-red' : 'bg-border-hi hover:bg-muted'}`}
            style={{ height: `${Math.max(heightPercent, 2)}%` }}
          />
        );
      })}
    </div>
  );
};
