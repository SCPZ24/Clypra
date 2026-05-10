import React, { useState } from "react";
import { Volume2, VolumeX, Lock, Unlock, Eye, EyeOff, X } from "lucide-react";
import { useTimelineStore } from "../../../store/timelineStore";
import { useUIStore } from "../../../store/uiStore";

interface TrackListProps {
  onEditTrack?: (trackId: string) => void;
}

export const TrackList: React.FC<TrackListProps> = ({ onEditTrack }) => {
  const { tracks, removeTrack, toggleTrackLock, toggleTrackMute, toggleTrackVisibility } = useTimelineStore();
  const { selectedTrackId, selectTrack } = useUIStore();
  // const [editingId, setEditingId] = useState<string | null>(null);
  // const [editingName, setEditingName] = useState("");

  // const handleDoubleClick = (trackId: string, name: string) => {
  //   setEditingId(trackId);
  //   setEditingName(name);
  // };

  // const handleNameChange = (trackId: string, newName: string) => {
  //   setEditingId(null);
  //   onEditTrack?.(trackId);
  // };

  return (
    <div className="w-40 border-r border-timeline-track-border flex flex-col bg-timeline-track-bg">
      <div className="h-8 px-3 border-b border-timeline-track-border flex items-center shrink-0 panel-head">
        <span className="text-[11px] font-semibold tracking-wide text-timeline-track-label uppercase">Track</span>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        {tracks.map((track) => (
          <div key={track.id} className={`group border-b border-timeline-track-border flex items-center gap-2 px-2 py-1 transition-colors ${selectedTrackId === track.id ? "bg-timeline-track-selected" : "hover:bg-timeline-track-hover"}`} style={{ height: `${track.height}px` }} onClick={() => selectTrack(track.id)}>
            {/* {editingId === track.id ? (
              <input autoFocus type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={() => handleNameChange(track.id, editingName)} onKeyPress={(e) => e.key === "Enter" && handleNameChange(track.id, editingName)} className="flex-1 bg-surface-raised border border-accent rounded px-1 py-0.5 text-xs text-text-primary focus:outline-none" />
            ) : (
              <div onDoubleClick={() => handleDoubleClick(track.id, track.name)} className="flex-1 text-[14px] font-medium text-[#d6d9de] truncate hover:text-cyan-300">
                {track.name}
              </div>
            )} */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTrackLock(track.id);
              }}
              className={`p-1 rounded transition-colors ${track.locked ? "bg-timeline-button-hover text-white" : "hover:bg-timeline-button-hover text-timeline-button-icon"}`}
              aria-label={track.locked ? "Unlock track" : "Lock track"}
            >
              {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTrackVisibility(track.id);
              }}
              className={`p-1 rounded transition-colors ${track.visible ? "hover:bg-timeline-button-hover text-timeline-button-icon" : "bg-timeline-button-hover text-white"}`}
              aria-label={track.visible ? "Hide track" : "Show track"}
            >
              {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTrackMute(track.id);
              }}
              className={`p-1 rounded transition-colors ${track.muted ? "bg-timeline-button-hover text-white" : "hover:bg-timeline-button-hover text-timeline-button-icon"}`}
              aria-label={track.muted ? "Unmute track" : "Mute track"}
            >
              {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTrack(track.id);
              }}
              className="p-1 hover:bg-danger/20 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3 text-danger" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
