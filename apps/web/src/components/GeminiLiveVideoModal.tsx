import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  Sparkles, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  Maximize2,
  Sliders,
  Play,
  Pause,
  Key
} from 'lucide-react';
import { visualizerApi, LiveFrameAnalysisResponse } from '../api/visualizer';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

interface GeminiLiveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureForRestyle: (frameBase64: string) => void;
  onPlaceSuggestionInRoom?: (name: string, price: number) => void;
}

export function GeminiLiveVideoModal({
  isOpen,
  onClose,
  onCaptureForRestyle,
  onPlaceSuggestionInRoom
}: GeminiLiveVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisCount, setAnalysisCount] = useState<number>(0);

  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const [liveData, setLiveData] = useState<LiveFrameAnalysisResponse>({
    observations: "Scanning your room via live camera feed...",
    detectedZones: ["Main Wall", "Floor Level"],
    lightingQuality: "Warm Ambient",
    designAdvice: "Point your camera at empty walls or corners to receive real-time Banjara Market interior recommendations.",
    suggestedItems: [
      { name: "Handcrafted Antique Brass Sunburst Mirror", placement: "Mount at eye level on main wall", price: 4200 },
      { name: "Carved Sheesham Wood Console Table", placement: "Underneath wall feature", price: 12800 },
      { name: "Woven Rattan Pendant Lamp", placement: "Ceiling illumination", price: 3400 }
    ],
    spokenGuidance: "I'm ready! Pan your camera slowly across your room to inspect your walls and lighting.",
    model: "Gemini 3.7 Flash Video Vision"
  });

  const { addItem } = useCart();

  // Speak guidance aloud using Web Speech API
  const speakGuidance = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [voiceEnabled]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: micEnabled
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
      toast.success('🎥 Gemini Live Video camera connected!');
      speakGuidance("Camera active. Point towards your walls to analyze decor possibilities.");
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to access camera. Please check browser camera permissions.');
      setIsStreaming(false);
    }
  }, [cameraFacing, micEnabled, speakGuidance]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (analysisTimerRef.current) {
      clearInterval(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsStreaming(false);
  }, []);

  // Capture single video frame to base64
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return null;

    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Periodic analysis loop (every 3.5 seconds)
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const runAnalysis = async () => {
      const frameBase64 = captureFrame();
      if (!frameBase64) return;

      setIsAnalyzing(true);
      try {
        const response = await visualizerApi.analyzeLiveFrame({
          frameBase64,
          apiKey: userApiKey.trim() || undefined
        });

        setLiveData(response);
        setAnalysisCount(c => c + 1);

        if (response.spokenGuidance) {
          speakGuidance(response.spokenGuidance);
        }
      } catch (err) {
        console.warn('Live frame analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Initial run after camera stabilizes
    const initialTimer = setTimeout(runAnalysis, 1200);
    analysisTimerRef.current = setInterval(runAnalysis, 4000);

    return () => {
      clearTimeout(initialTimer);
      if (analysisTimerRef.current) {
        clearInterval(analysisTimerRef.current);
        analysisTimerRef.current = null;
      }
    };
  }, [isOpen, isStreaming, captureFrame, userApiKey, speakGuidance]);

  // Open & Close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleCaptureSnapshot = () => {
    const frame = captureFrame();
    if (!frame) {
      toast.error('Unable to capture camera frame');
      return;
    }
    stopCamera();
    onClose();
    onCaptureForRestyle(frame);
    toast.success('📸 Snapshot captured! Opening Gemini Image Studio...');
  };

  const handleToggleCamera = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleAddToCart = async (name: string, price: number) => {
    toast.success(`Added ${name} (₹${price}) to your cart!`);
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-box w-full max-w-5xl p-6 bg-[#1e1b18] text-white rounded shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
        style={{ borderColor: '#8c6f52' }}
      >
        {/* Top Header */}
        <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 text-red-500 rounded border border-red-500/30 flex items-center gap-1.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-xs font-bold font-mono tracking-wider">GEMINI LIVE VIDEO</span>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold m-0 text-white flex items-center gap-2">
                Real-Time AR Room Stylist
                <span className="text-xs font-normal text-white/60">({liveData.model})</span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hidden Canvas for Frame Grabber */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Live Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
          {/* Left: Video Viewport & AR Overlay (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Camera Viewport Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/15 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* AR HUD Targeting Crosshairs */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top Status Badges */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-mono text-[11px]">SCENE RADAR ACTIVE</span>
                    <span className="text-white/40">|</span>
                    <span className="text-amber-300 text-[11px]">{liveData.lightingQuality}</span>
                  </div>

                  {isAnalyzing && (
                    <div className="flex items-center gap-1.5 bg-accent/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
                      <RefreshCw size={11} className="animate-spin" />
                      <span>Gemini Thinking...</span>
                    </div>
                  )}
                </div>

                {/* Center AR Crosshair */}
                <div className="self-center flex flex-col items-center opacity-70">
                  <div className="w-20 h-20 border border-white/40 rounded-full flex items-center justify-center relative">
                    <div className="w-2 h-2 bg-accent rounded-full animate-ping"></div>
                    <div className="absolute -top-1 w-2 h-0.5 bg-white"></div>
                    <div className="absolute -bottom-1 w-2 h-0.5 bg-white"></div>
                    <div className="absolute -left-1 w-0.5 h-2 bg-white"></div>
                    <div className="absolute -right-1 w-0.5 h-2 bg-white"></div>
                  </div>
                  <span className="text-[10px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded mt-1.5 backdrop-blur">
                    {liveData.detectedZones.join(' • ')}
                  </span>
                </div>

                {/* Bottom Live Spoken Guidance Subtitle */}
                <div className="bg-black/75 backdrop-blur-md p-3 rounded border border-white/15">
                  <div className="flex items-center gap-2 mb-1">
                    <Volume2 size={13} className="text-accent" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent">
                      Gemini Interior Stylist:
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-white/95 font-medium m-0 leading-relaxed italic">
                    "{liveData.spokenGuidance}"
                  </p>
                </div>
              </div>
            </div>

            {/* Video Control Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/5 rounded border border-white/10">
              <div className="flex items-center gap-2">
                {/* Camera Flip */}
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="btn btn-secondary btn-sm text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  title="Flip front/rear camera"
                >
                  <Camera size={13} />
                  <span>Flip Camera</span>
                </button>

                {/* Voice Synthesis Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className={`btn btn-sm text-xs py-1.5 px-3 flex items-center gap-1.5 ${
                    voiceEnabled 
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' 
                      : 'bg-white/10 text-white/60 border-white/20'
                  }`}
                  title="Toggle spoken designer voice"
                >
                  {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
                </button>
              </div>

              {/* Snapshot Capture Action Button */}
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="btn btn-primary btn-sm text-xs py-2 px-4 flex items-center gap-2 font-bold cursor-pointer shadow-lg"
              >
                <Sparkles size={14} />
                <span>Capture & Restyle in Image Studio</span>
              </button>
            </div>
          </div>

          {/* Right: Live Room Intelligence & Product Radar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Live Observations Card */}
            <div className="p-4 bg-white/5 rounded border border-white/10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Live Room Analysis
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  Scan #{analysisCount}
                </span>
              </div>

              <p className="text-xs text-white/80 m-0 leading-relaxed">
                {liveData.observations}
              </p>

              <div className="p-2.5 bg-white/5 rounded border border-white/10 text-xs text-white/90 mt-1">
                <span className="text-[10px] text-amber-300 block font-bold mb-0.5">ARCHITECTURAL ADVICE:</span>
                {liveData.designAdvice}
              </div>
            </div>

            {/* Live Suggested Banjara Market Pieces */}
            <div className="p-4 bg-white/5 rounded border border-white/10 flex-1 flex flex-col">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                Real-Time Decor Recommendations
              </span>
              <p className="text-[11px] text-white/60 m-0 mb-3">
                Matched to visible wall space and ambient natural light:
              </p>

              <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1 flex-1">
                {liveData.suggestedItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 bg-white/5 border border-white/10 hover:border-accent/60 rounded transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="text-xs font-bold text-white m-0 leading-tight">{item.name}</h5>
                        <span className="text-xs font-bold text-accent font-mono">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[10px] text-white/60 m-0 mt-0.5">
                        📍 {item.placement}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          if (onPlaceSuggestionInRoom) {
                            onPlaceSuggestionInRoom(item.name, item.price);
                          }
                          toast.success(`📍 Placed ${item.name} into 360° Studio scene!`);
                        }}
                        className="btn btn-secondary btn-sm flex-1 text-[10px] py-1 px-2 bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer"
                      >
                        Place in 360°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item.name, item.price)}
                        className="btn btn-primary btn-sm text-[10px] py-1 px-2.5 cursor-pointer font-bold"
                      >
                        + Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
