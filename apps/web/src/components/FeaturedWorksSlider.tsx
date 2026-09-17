import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Eye, Layers, Compass, Pause, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectWork {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  roomType: string;
  roomSlug: string;
  image: string;
  craftPillars: string[];
  metrics: {
    area: string;
    timeline: string;
    artisanFamilies: string;
  };
  description: string;
}

const PROJECTS: ProjectWork[] = [
  {
    id: 'vasant-vihar-penthouse',
    title: 'The Vasant Vihar Penthouse',
    subtitle: 'Living Hall & Terracotta Botanical Focal Wall',
    location: 'Vasant Vihar, South Delhi',
    roomType: 'Living Room',
    roomSlug: 'living-room',
    image: '/images/interiorg-hero-banner.jpg',
    craftPillars: [
      'Hand-Carved Sheesham Console',
      'Sand-Cast Sunburst Brass Mirror',
      'Terracotta & Sage Botanical Mural'
    ],
    metrics: {
      area: '240 sq ft Wall Coverage',
      timeline: '12 Days Bespoke Fit',
      artisanFamilies: '4 Master Guilds'
    },
    description: 'A contemporary penthouse sanctuary balancing natural light with earthy Rajasthani heritage. Features a 10-ft floor-to-ceiling bespoke wallpaper mural matched to solid seasoned Sheesham woodwork and authentic hand-hammered antique brass accents.'
  },
  {
    id: 'gurugram-golf-villa',
    title: 'The Gurugram Golf Course Villa',
    subtitle: 'Organic Live-Edge Dining & Fluted Architecture',
    location: 'DLF Phase 5, Gurugram',
    roomType: 'Dining',
    roomSlug: 'dining',
    image: '/images/project-dining.jpg',
    craftPillars: [
      'Live-Edge Sheesham 8-Seater',
      'Hand-Hammered Brass Pendants',
      'Fluted Terracotta Acoustic Wall'
    ],
    metrics: {
      area: '180 sq ft Feature Wall',
      timeline: '8 Days Installation',
      artisanFamilies: '3 Master Guilds'
    },
    description: 'An architectural dining pavilion centered around a 9-foot single-slab Sheesham dining table. Fluted terracotta acoustic wall panels provide warm texture and echo dampening, illuminated by triple antique brass dome pendants.'
  },
  {
    id: 'heritage-boho-suite',
    title: 'The Heritage Bohemian Suite',
    subtitle: 'Royal Teakwood Jharokha & Gold Leaf Murals',
    location: 'Civil Lines, Jaipur',
    roomType: 'Drawing Room',
    roomSlug: 'drawing-room',
    image: '/images/project-bedroom.jpg',
    craftPillars: [
      'Peacock Carved Teak Headboard',
      'Gold Leaf Floral Wall Mural',
      'Antique Brass Articulated Sconces'
    ],
    metrics: {
      area: '210 sq ft Accent Wall',
      timeline: '14 Days Crafting',
      artisanFamilies: '5 Master Guilds'
    },
    description: 'Traditional Marwari royal elegance reinterpreted for modern wellness. An intricately carved peacock teak arch framing the focal bed is set against a bespoke gold leaf floral mural with organic cane bedside details.'
  }
];

export function FeaturedWorksSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const activeProject = PROJECTS[activeIndex];

  // Progress bar ticker (resets every 5 seconds)
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const intervalTime = 50; // ms
    const totalTime = 5500; // ms
    const increment = (intervalTime / totalTime) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + increment;
      });
    }, intervalTime);

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % PROJECTS.length);
    }, totalTime);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [activeIndex, isPaused]);

  const handleNext = () => {
    setProgress(0);
    setActiveIndex((prev) => (prev + 1) % PROJECTS.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setActiveIndex((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);
  };

  const handleSelectSlide = (idx: number) => {
    setProgress(0);
    setActiveIndex(idx);
  };

  const handleShopLook = (roomSlug: string) => {
    navigate(`/?room=${roomSlug}#shop`);
  };

  return (
    <section id="works" className="works-slider-section page pt-8 pb-8">
      {/* Header bar */}
      <div className="section-header flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge badge-yellow text-xs flex items-center gap-1 font-semibold">
              <Sparkles size={12} className="text-accent" /> Completed Transformations
            </span>
            <span className="text-xs text-muted">Architectural Projects & Real Homes</span>
          </div>
          <h2 className="text-3xl md:text-4xl m-0 font-normal font-playfair">Featured Interior Works</h2>
          <p className="text-muted text-xs md:text-sm mt-1 max-w-xl">
            Explore authentic interior transformations curated with Banjara Market handcrafted woodwork, sand-cast brass, and bespoke wall murals across premier residences.
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-ghost btn-sm p-2 rounded-full border border-gray-300 hover:bg-white text-xs flex items-center gap-1.5"
            title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span className="hidden sm:inline">{isPaused ? 'Play' : 'Pause'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrev}
            className="btn btn-ghost btn-sm p-2 rounded-full border border-gray-300 hover:bg-white"
            aria-label="Previous Project"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-ghost btn-sm p-2 rounded-full border border-gray-300 hover:bg-white"
            aria-label="Next Project"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Slider Canvas */}
      <div 
        className="works-slider-container relative rounded-lg overflow-hidden bg-dark shadow-lg"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Animated Progress Bar */}
        <div className="works-progress-bar-track absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div 
            className="works-progress-bar-fill h-full bg-accent transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Slides Viewport */}
        <div className="relative min-h-[460px] md:min-h-[540px] flex items-end">
          {PROJECTS.map((proj, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={proj.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover object-center"
                />
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
              </div>
            );
          })}

          {/* Floating Project Details Card */}
          <div className="relative z-20 w-full p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-yellow text-xs font-semibold px-2.5 py-0.5">
                  {activeProject.roomType}
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1">
                  <Compass size={13} /> {activeProject.location}
                </span>
              </div>

              <h3 className="text-2xl md:text-4xl font-playfair font-normal m-0 text-white leading-tight">
                {activeProject.title}
              </h3>
              <p className="text-accent-light text-sm md:text-base font-medium mt-1 mb-3 text-[#e2cbb2]">
                {activeProject.subtitle}
              </p>

              <p className="text-xs md:text-sm text-white/85 line-clamp-2 md:line-clamp-none max-w-xl mb-4 font-light leading-relaxed">
                {activeProject.description}
              </p>

              {/* Craft Pillars Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {activeProject.craftPillars.map((pill, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded bg-white/15 backdrop-blur-md text-white/90 border border-white/20 flex items-center gap-1.5"
                  >
                    <Layers size={11} className="text-[#c4a982]" /> {pill}
                  </span>
                ))}
              </div>

              {/* Specs Metric Row */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20 max-w-lg">
                <div>
                  <span className="text-[11px] text-white/60 block uppercase tracking-wider">Wall Area</span>
                  <strong className="text-xs md:text-sm text-white">{activeProject.metrics.area}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-white/60 block uppercase tracking-wider">Turnaround</span>
                  <strong className="text-xs md:text-sm text-white">{activeProject.metrics.timeline}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-white/60 block uppercase tracking-wider">Artisans</span>
                  <strong className="text-xs md:text-sm text-white">{activeProject.metrics.artisanFamilies}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleShopLook(activeProject.roomSlug)}
                className="btn btn-primary bg-[#8c6f52] hover:bg-[#735940] text-white border-none py-3 px-5 text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer font-medium"
              >
                <span>Shop This Room</span>
                <ArrowRight size={16} />
              </button>
              <a
                href="#custom"
                className="btn btn-ghost bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 py-3 px-5 text-sm flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <Eye size={16} />
                <span>Customize Similar Wall</span>
              </a>
            </div>
          </div>
        </div>

        {/* Slide Thumbnail Tabs / Dot Indicator Bar */}
        <div className="works-thumbnails-bar p-3 bg-[#1e1c1a] border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                className={`text-left px-3 py-1.5 rounded transition-all cursor-pointer border flex items-center gap-2 ${
                  idx === activeIndex
                    ? 'bg-white/20 border-[#c4a982] text-white'
                    : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div 
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeIndex ? 'bg-[#c4a982] scale-125' : 'bg-white/40'
                  }`} 
                />
                <span className="text-xs font-medium whitespace-nowrap">{proj.title}</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-white/50 font-mono pr-2">
            0{activeIndex + 1} / 0{PROJECTS.length}
          </span>
        </div>
      </div>
    </section>
  );
}
