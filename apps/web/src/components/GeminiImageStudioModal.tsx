import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  Check, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  Key, 
  Palette,
  Sliders,
  Eye
} from 'lucide-react';
import { visualizerApi, RestyleImageResponse } from '../api/visualizer';
import toast from 'react-hot-toast';

interface GeminiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomImageUrl: string;
  onLoadIntoStudio: (newImageUrl: string) => void;
}

const STYLE_PRESETS = [
  {
    id: 'banjara-heritage',
    name: 'Banjara Market Sheesham & Brass',
    desc: 'Solid Sheesham wood consoles, ornate sunburst brass mirrors, and rattan lighting',
    prompt: 'Incorporate solid Sheesham wood consoles, ornate sunburst brass mirrors, woven cane rattan pendant lamps, and artisan terracotta vases.'
  },
  {
    id: 'boho-terracotta',
    name: 'Terracotta Bohemian Arch Wallpaper',
    desc: 'Warm terracotta arch mural, textured lime-wash wall, and ambient brass sconces',
    prompt: 'Dress the main accent wall in a terracotta geometric arch wallpaper with warm ambient brass wall sconces and textured linen seating.'
  },
  {
    id: 'japandi-minimal',
    name: 'Minimalist Japandi Neutral',
    desc: 'Fluted wood slat panels, warm cream walls, and clean organic forms',
    prompt: 'Restyle with minimalist Japandi aesthetic: vertical fluted light wood slats on focal wall, warm cream tones, and sculptured ceramic table decor.'
  },
  {
    id: 'royal-heritage',
    name: 'Royal Heritage Carved Teakwood',
    desc: 'Intricate floral wall murals, antique copper fixtures, and carved timber',
    prompt: 'Transform into a luxurious Indian heritage suite: hand-painted Jaipur botanical wall mural, carved teakwood furniture, and antique hammered copper accents.'
  }
];

export function GeminiImageStudioModal({
  isOpen,
  onClose,
  currentRoomImageUrl,
  onLoadIntoStudio
}: GeminiImageStudioModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_PRESETS[0].id);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [uploadedBase64, setUploadedBase64] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [useUploadedImage, setUseUploadedImage] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [result, setResult] = useState<RestyleImageResponse | null>(null);
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'GENERATED'>('SIDE_BY_SIDE');

  useEffect(() => {
    if (userApiKey) {
      localStorage.setItem('gemini_api_key', userApiKey.trim());
    }
  }, [userApiKey]);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid JPG or PNG room image');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setUploadedBase64(b64);
      setUseUploadedImage(true);
      toast.success(`Uploaded ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const activeSourceImage = useUploadedImage && uploadedBase64 
    ? uploadedBase64 
    : currentRoomImageUrl;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep('Connecting to Google Gemini Image Engine...');

    try {
      const chosenPreset = STYLE_PRESETS.find(p => p.id === selectedStyle);
      const promptToUse = customPrompt.trim() 
        ? customPrompt 
        : (chosenPreset?.prompt || '');

      setGenerationStep('Uploading base64 image & processing text prompt...');

      let base64ToSend = '';
      if (useUploadedImage && uploadedBase64) {
        base64ToSend = uploadedBase64;
      } else if (currentRoomImageUrl) {
        try {
          const fetched = await fetch(currentRoomImageUrl);
          const blob = await fetched.blob();
          base64ToSend = await new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
        } catch {
          base64ToSend = '';
        }
      }

      setGenerationStep('Gemini 3.1 Flash Image (Nano Banana 2) synthesizing room render...');

      const response = await visualizerApi.restyleImage({
        imageBase64: base64ToSend || undefined,
        style: chosenPreset?.name || 'Banjara Luxury Restyle',
        prompt: promptToUse,
        apiKey: userApiKey.trim() || undefined
      });

      setResult(response);
      setViewMode('SIDE_BY_SIDE');
      toast.success('✨ Room image restyled with Gemini AI!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApplyToStudio = () => {
    if (!result?.imageUrl) return;
    onLoadIntoStudio(result.imageUrl);
    toast.success('🎉 Gemini AI generated room loaded into 360° Studio!');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-box w-full max-w-4xl p-6 bg-white rounded shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        style={{ borderColor: '#ded9d0' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 mb-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-yellow text-xs font-semibold flex items-center gap-1">
                <Sparkles size={13} className="text-accent" />
                Gemini 3.1 Flash Image
              </span>
              <span className="badge badge-green text-xs font-mono">Nano Banana 2</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mt-1 mb-0 text-dark">
              Gemini AI Image Studio & Room Restyling
            </h2>
            <p className="text-xs text-muted mt-1 m-0">
              Upload your room picture and let Google Gemini AI synthesize photorealistic interior designs styled with Banjara Market decor.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-dark rounded border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Optional Gemini API Key Bar */}
        <div className="mb-4 p-3 bg-[#faf8f5] rounded border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs">
              <Key size={14} className="text-accent" />
              <span className="font-semibold text-dark">Google Gemini API Key</span>
              <span className="text-muted text-[11px]">(Optional — server default active)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-accent font-semibold hover:underline border-none bg-transparent cursor-pointer"
            >
              {showKeyInput ? 'Hide Key' : userApiKey ? '✓ Key Configured (Edit)' : '+ Add Your Own Key'}
            </button>
          </div>

          {showKeyInput && (
            <div className="mt-2.5 pt-2 border-t flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... (from Google AI Studio)"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="flex-1 text-xs py-1.5 px-3 border rounded focus:outline-none focus:border-dark"
              />
              <button
                type="button"
                onClick={() => {
                  setShowKeyInput(false);
                  toast.success('Gemini API key saved in browser storage');
                }}
                className="btn btn-primary btn-sm text-xs py-1 px-3 cursor-pointer"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
          {/* Left Column: Source Image & Style Configuration (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Source Image Selector */}
            <div className="border rounded p-3.5 bg-white">
              <span className="text-xs font-bold text-dark block mb-2">1. Source Room Image</span>
              
              {/* Image Source Switcher */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUseUploadedImage(false)}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded border cursor-pointer transition-all ${
                    !useUploadedImage
                      ? 'bg-dark text-white border-dark'
                      : 'bg-white text-muted border-gray-200 hover:text-dark'
                  }`}
                >
                  Active 360 Room
                </button>
                <label
                  className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded border cursor-pointer text-center transition-all flex items-center justify-center gap-1 ${
                    useUploadedImage
                      ? 'bg-dark text-white border-dark'
                      : 'bg-white text-muted border-gray-200 hover:text-dark'
                  }`}
                >
                  <UploadCloud size={12} />
                  <span>{uploadedFileName ? 'Uploaded ✓' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview Thumbnail */}
              <div className="relative aspect-video rounded overflow-hidden border bg-gray-100 group">
                <img
                  src={activeSourceImage}
                  alt="Source room"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-dark/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
                  {useUploadedImage ? `Uploaded: ${uploadedFileName || 'Custom'}` : 'Current 360 Room View'}
                </span>
              </div>
            </div>

            {/* Aesthetic Style Selector */}
            <div className="border rounded p-3.5 bg-white flex-1">
              <span className="text-xs font-bold text-dark block mb-2">2. Choose Redesign Style</span>
              
              <div className="space-y-2">
                {STYLE_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedStyle(preset.id)}
                    className={`p-2.5 rounded border cursor-pointer transition-all ${
                      selectedStyle === preset.id
                        ? 'border-[#8c6f52] bg-[#faf6f0] shadow-sm'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-dark">{preset.name}</span>
                      {selectedStyle === preset.id && (
                        <Check size={14} className="text-accent" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted m-0 mt-0.5 leading-snug">
                      {preset.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Custom Prompt Text Area */}
              <div className="mt-3 pt-3 border-t">
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Custom Prompt Additions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Add an arched terracotta wallpaper, low brass coffee table, and extra ambient warm lighting..."
                  className="w-full text-xs p-2 border rounded focus:outline-none focus:border-dark bg-[#faf8f5] focus:bg-white resize-none"
                />
              </div>

              {/* Generate CTA Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-primary w-full mt-3 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Synthesizing Room...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Redesign with Gemini AI</span>
                  </>
                )}
              </button>

              {isGenerating && generationStep && (
                <p className="text-[11px] text-accent text-center mt-2 m-0 animate-pulse font-medium">
                  {generationStep}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Comparison & Synthesis Output (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-dark">
                {result ? 'Generated Interior Design' : 'Preview Area'}
              </span>

              {result && (
                <div className="flex gap-1 bg-gray-100 p-0.5 rounded border text-[10px]">
                  <button
                    type="button"
                    onClick={() => setViewMode('SIDE_BY_SIDE')}
                    className={`py-1 px-2 rounded border-none cursor-pointer font-semibold ${
                      viewMode === 'SIDE_BY_SIDE' ? 'bg-white text-dark shadow-sm' : 'bg-transparent text-muted'
                    }`}
                  >
                    Before & After
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('GENERATED')}
                    className={`py-1 px-2 rounded border-none cursor-pointer font-semibold ${
                      viewMode === 'GENERATED' ? 'bg-white text-dark shadow-sm' : 'bg-transparent text-muted'
                    }`}
                  >
                    Generated Only
                  </button>
                </div>
              )}
            </div>

            {/* Output Display Canvas */}
            <div className="flex-1 min-h-[380px] bg-[#faf8f5] border rounded overflow-hidden flex flex-col items-center justify-center p-4 relative">
              {!result && !isGenerating && (
                <div className="text-center p-6 max-w-sm">
                  <Sparkles size={36} className="mx-auto text-accent opacity-60 mb-3" />
                  <h4 className="text-sm font-bold text-dark m-0">Ready to Redesign Your Room</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Select a Banjara Market aesthetic style from the left panel and click <strong>"Redesign with Gemini AI"</strong> to generate your transformed room.
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center p-8">
                  <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-dark m-0">Generating with Gemini 3.1 Flash Image</h4>
                  <p className="text-xs text-muted mt-1">{generationStep}</p>
                </div>
              )}

              {result && !isGenerating && (
                <div className="w-full h-full flex flex-col justify-between">
                  {viewMode === 'SIDE_BY_SIDE' ? (
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      {/* Before */}
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-muted mb-1">Original Room:</span>
                        <div className="flex-1 rounded overflow-hidden border bg-black/5 relative">
                          <img
                            src={activeSourceImage}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-dark/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
                            Before
                          </span>
                        </div>
                      </div>

                      {/* After */}
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-accent mb-1 flex items-center gap-1">
                          <Sparkles size={12} /> Gemini Restyled:
                        </span>
                        <div className="flex-1 rounded overflow-hidden border-2 border-accent bg-black/5 relative shadow-md">
                          <img
                            src={result.imageUrl}
                            alt="Gemini AI Restyled"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-[#8c6f52] text-white text-[10px] px-2 py-0.5 rounded font-bold shadow">
                            Gemini AI
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded overflow-hidden border-2 border-accent relative shadow-md">
                      <img
                        src={result.imageUrl}
                        alt="Gemini AI Restyled"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#8c6f52] text-white text-[10px] px-2.5 py-0.5 rounded font-bold shadow">
                        Gemini 3.1 Flash Image
                      </span>
                    </div>
                  )}

                  {/* Result Details & Action Bar */}
                  <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="badge badge-yellow text-[10px] font-semibold mr-2">
                        {result.model}
                      </span>
                      <span className="text-xs font-semibold text-dark">{result.style}</span>
                      <p className="text-[11px] text-muted m-0 mt-0.5 line-clamp-1">
                        {result.designNotes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={result.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm text-xs py-2 px-3 flex items-center gap-1"
                        download="gemini-restyled-room.jpg"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleApplyToStudio}
                        className="btn btn-primary btn-sm text-xs py-2 px-4 flex items-center gap-1.5 font-bold cursor-pointer"
                      >
                        <ArrowRight size={13} />
                        <span>Load into 360° Studio</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
