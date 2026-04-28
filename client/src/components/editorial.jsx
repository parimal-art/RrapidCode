import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Fullscreen, Volume2, Heart, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null); // 'like' or 'dislike'
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [videoQualities] = useState([
    { label: '1080p', value: '1080' },
    { label: '720p', value: '720' },
    { label: '480p', value: '480' },
    { label: '360p', value: '360' }
  ]);
  const [selectedQuality, setSelectedQuality] = useState('1080');

  // Empty state when no video URL
  if (!secureUrl) {
    return (
      <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
        <div className="w-full aspect-video flex items-center justify-center flex-col p-8 text-center">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Video Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This video content is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLike = () => {
    if (userReaction === 'like') {
      setLikes(likes - 1);
      setUserReaction(null);
    } else {
      if (userReaction === 'dislike') {
        setDislikes(dislikes - 1);
      }
      setLikes(likes + 1);
      setUserReaction('like');
    }
  };

  const handleDislike = () => {
    if (userReaction === 'dislike') {
      setDislikes(dislikes - 1);
      setUserReaction(null);
    } else {
      if (userReaction === 'like') {
        setLikes(likes - 1);
      }
      setDislikes(dislikes + 1);
      setUserReaction('dislike');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toLocaleTimeString(),
        user: 'You' // In real app, this would be actual user data
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-lg bg-black"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={secureUrl}
          poster={thumbnailUrl}
          onClick={togglePlayPause}
          className="w-full aspect-video bg-black cursor-pointer"
        />
        
        {/* Video Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-300 ${
            isHovering || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Top Controls Bar */}
          <div className="flex justify-between items-center mb-3">
            {/* Left Side - Playback Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlayPause}
                className="btn btn-circle btn-primary btn-sm"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-white" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="range range-primary range-xs w-20"
                />
              </div>

              {/* Playback Speed */}
              <select 
                value={playbackRate}
                onChange={(e) => handlePlaybackRate(parseFloat(e.target.value))}
                className="select select-bordered select-xs text-white bg-gray-700 border-gray-600"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {/* Video Quality */}
              <select 
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="select select-bordered select-xs text-white bg-gray-700 border-gray-600"
              >
                {videoQualities.map(quality => (
                  <option key={quality.value} value={quality.value}>
                    {quality.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Side - Additional Controls */}
            <div className="flex items-center space-x-2">
              {/* Like/Dislike Buttons */}
              <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={handleLike}
                  className={`btn btn-ghost btn-xs ${userReaction === 'like' ? 'text-green-500' : 'text-white'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="ml-1">{likes}</span>
                </button>
                <div className="w-px h-4 bg-gray-600"></div>
                <button
                  onClick={handleDislike}
                  className={`btn btn-ghost btn-xs ${userReaction === 'dislike' ? 'text-red-500' : 'text-white'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="ml-1">{dislikes}</span>
                </button>
              </div>

              {/* Comment Toggle */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="btn btn-ghost btn-sm text-white"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="btn btn-ghost btn-sm text-white"
              >
                <Fullscreen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center w-full">
            <span className="text-white text-xs mr-2 min-w-10">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="range range-primary range-xs flex-1"
            />
            <span className="text-white text-xs ml-2 min-w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments ({comments.length})
          </h3>
          
          {/* Add Comment */}
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="textarea textarea-bordered w-full h-20 resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddComment();
                }
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                Press Ctrl+Enter to post
              </span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="btn btn-primary btn-sm"
              >
                Post Comment
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{comment.user}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Editorial;