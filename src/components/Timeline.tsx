import { useOsintStore } from '../store';

export default function Timeline() {
  const { sliderTimestamp, setSliderTimestamp } = useOsintStore();
  const dayAgo = Date.now() - 86400000;

  return (
    <div className="w-full bg-black/60 p-4 border border-gray-800 backdrop-blur-md">
      <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2 uppercase">
        <span>-24 Hours</span>
        <span>Real-time Feed</span>
      </div>
      <input 
        type="range" 
        min={dayAgo} 
        max={Date.now()} 
        value={sliderTimestamp}
        onChange={(e) => setSliderTimestamp(Number(e.target.value))}
        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
      />
    </div>
  );
}