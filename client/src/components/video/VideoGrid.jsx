import React from 'react';
import VideoTile from './VideoTile';

export const VideoGrid = ({
  localStream,
  remoteStreams = new Map(),
  currentUser,
  isAudioEnabled,
  isVideoEnabled,
  isHandRaised,
  isTeacher,
  classroomTeacherId,
}) => {
  const remoteEntries = Array.from(remoteStreams.entries());
  const totalTiles = 1 + remoteEntries.length;

  // Compute responsive dynamic grid columns based on total participants
  const getGridColsClass = () => {
    if (totalTiles === 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (totalTiles === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalTiles <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (totalTiles <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className={`grid ${getGridColsClass()} gap-3 w-full h-full p-2 auto-rows-fr`}>
      {/* Self / Local Video Tile */}
      <VideoTile
        stream={localStream}
        user={currentUser}
        isLocal={true}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        isTeacher={currentUser?.role === 'teacher'}
      />

      {/* Remote Video Tiles */}
      {remoteEntries.map(([peerSocketId, data]) => (
        <VideoTile
          key={peerSocketId}
          stream={data.stream}
          user={data.user}
          isLocal={false}
          isAudioEnabled={data.isAudioEnabled}
          isVideoEnabled={data.isVideoEnabled}
          isHandRaised={data.isHandRaised}
          isTeacher={data.user?.role === 'teacher' || data.user?._id === classroomTeacherId}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
