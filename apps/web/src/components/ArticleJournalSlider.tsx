import React, { useState } from 'react';
import { BookOpen, Clock, User, ArrowRight, X, Sparkles, ChevronLeft, ChevronRight, Share2, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  authorRole: string;
  date: string;
  image: string;
  summary: string;
  tags: string[];
  content: string[];
  quote?: {
    text: string;
    speaker: string;
  };
}

const ARTICLES: ArticleItem[] = [
  {
    id: 'seasoned-sheesham-revival',
    title: 'The Resurgence of Seasoned Sheesham: Why Traditional Joinery Outlasts Fast Furniture',
    category: 'Woodcraft & Joinery',
    readTime: '4 min read',
    author: 'Ramavatar Banjara',
    authorRole: '3rd Generation Master Woodcarver',
    date: 'September 2026',
    image: '/images/project-bedroom.jpg',
    summary: 'Why 40-year seasoned Indian Rosewood and mortise-and-tenon craftsmanship withstand humidity and seasonal shifts far superior to modern veneer particleboards.',
    tags: ['Sheesham Wood', 'Traditional Joinery', 'Sustainability'],
    quote: {
      text: 'Wood is not dead material; it breathes with every monsoon and dry winter. When we hand-plane seasoned Sheesham, we are continuing its life for another century.',
      speaker: 'Ramavatar Banjara'
    },
    content: [
      'In an era dominated by flat-pack MDF and disposable composite furniture, seasoned Indian Rosewood (Sheesham) has staged a dramatic architectural renaissance across contemporary Indian homes.',
      'Unlike factory-glued laminates that bubble under North Indian humidity or delaminate near coastal air, solid Sheesham timber is kiln-dried and seasoned for multiple seasons. This allows the natural resin pores to stabilize completely.',
      'At Banjara Market Sector 58, master woodworkers utilize floating mortise-and-tenon joinery and dovetailed lap joints. By avoiding rigid industrial nails, the wood is free to make microscopic natural expansions without warping or structural fracturing.',
      'When you invest in a hand-carved console or a solid headboard, you are not simply decorating a bedroom — you are anchoring your living space with an heirloom that deepens in patina and richness over generations.'
    ]
  },
  {
    id: 'scale-light-wall-murals',
    title: 'Scale, Aspect & Natural Light: Architectural Rules for Bespoke Murals in Compact Rooms',
    category: 'Styling Guide',
    readTime: '5 min read',
    author: 'Ananya Sen',
    authorRole: 'Senior Architectural Interior Stylist',
    date: 'August 2026',
    image: '/images/interiorg-hero-banner.jpg',
    summary: 'A practical masterclass in selecting mural scales: how to prevent bold Rajasthani botanical motifs from overwhelming 9-foot urban ceilings while amplifying natural daylight.',
    tags: ['Wallpaper Design', 'Ceiling Height', 'Color Harmony'],
    quote: {
      text: 'A mural should never shrink your room; when scaled to your ceiling proportions, it functions like an architectural window opening into nature.',
      speaker: 'Ananya Sen'
    },
    content: [
      'One of the most frequent misconceptions in modern apartment decor is that compact rooms require strictly neutral, pattern-free walls. In reality, an undersized repeat pattern can make a room feel repetitive and visually boxed in.',
      'When designing made-to-measure murals, the vertical horizon line must align with the room\'s natural focal plane (typically between 36 and 48 inches from the finished floor). This establishes an optical anchor that lifts the eye upwards.',
      'For standard 9.5-foot apartment heights, botanical murals that transition from deep earthen terracotta or ochre at the base to airy sage, cream, or gold leaf near the crown moulding create an illusion of vertical expansiveness.',
      'By utilizing seamless non-reflective textured canvas substrates, you eliminate glare from morning windows, ensuring the mural feels like an authentic fresco hand-painted directly onto lime-plastered walls.'
    ]
  },
  {
    id: 'sand-cast-antique-brass',
    title: 'Four Generations of Sand-Cast Brass: Inside the Sector 58 Artisan Guild',
    category: 'Artisan Heritage',
    readTime: '6 min read',
    author: 'Gurugram Guild Archives',
    authorRole: 'Craft Preservation Documentation',
    date: 'September 2026',
    image: '/images/project-dining.jpg',
    summary: 'Step behind the roadside stalls into the sand-casting foundries where antique sunburst mirrors and brass urlis are beaten with hand mallets, preserving 200-year techniques.',
    tags: ['Banjara Market', 'Antique Brass', 'Heritage Guild'],
    quote: {
      text: 'Every mallet strike leaves a singular facet that reflects candlelight in a way no stamping machine can replicate.',
      speaker: 'Kishan Lal, Brass Coppersmith'
    },
    content: [
      'Long before Sector 58 became a landmark for interior designers across the NCR, nomadic artisan families carried sand-casting patterns and forge tools across Rajasthan, Haryana, and Gujarat.',
      'The process begins with riverbed silica sand tightly compacted around a carved wooden matrix. Molten recycled brass and bell metal are hand-poured at over 950°C into the sand molds.',
      'Once cooled, the piece is not electroplated with shiny synthetic chrome. Instead, it is planished with round-head hammers, hand-filed, and treated with natural tamarind, sea salt, and beeswax to induce a gentle, living antique verdigris patina.',
      'These antique brass sunburst frames and dome chandeliers do not merely illuminate a room; they carry the tactile signature of human effort, capturing both daylight and evening lamplight with organic warmth.'
    ]
  },
  {
    id: 'japandi-banjara-synthesis',
    title: 'The Japandi-Banjara Synthesis: Harmonizing Organic Textures with Wabi-Sabi Minimalism',
    category: 'Design Philosophy',
    readTime: '4 min read',
    author: 'Kavita Mehta',
    authorRole: 'Architectural Digest Contributing Editor',
    date: 'July 2026',
    image: '/images/interiorg-hero-banner.jpg',
    summary: 'How leading architects are marrying Japanese wabi-sabi simplicity with Indian terracotta, handwoven cane, and distressed vintage console tables.',
    tags: ['Japandi', 'Terracotta', 'Modern Living'],
    quote: {
      text: 'Both Japanese craftsmanship and Indian artisan traditions share the same reverence for honest materials that bear the traces of time.',
      speaker: 'Kavita Mehta'
    },
    content: [
      'At first glance, Japanese minimalism and traditional Indian interior crafts might seem aesthetically opposite: one celebrated for strict austerity, the other for vibrant ornamentation.',
      'Yet, at their philosophical cores, both traditions embrace wabi-sabi — the quiet beauty of impermanence, honest textures, and unpretentious natural elements.',
      'The modern Japandi-Banjara aesthetic marries clean architectural planes (limewash walls, unadorned concrete or light oak floors) with singular, highly expressive focal points: a rough-hewn distressed Sheesham stool, a ribbed terracotta urn, or a raw silk botanical mural.',
      'The result is neither cluttered nor sterile. It is a deeply restful, tactile sanctuary that feels grounded in earth and architectural restraint.'
    ]
  }
];

export function ArticleJournalSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  const maxIndex = ARTICLES.length - 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleShare = (article: ArticleItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article link copied to clipboard!');
    }
  };

  return (
    <section id="journal" className="journal-slider-section page pt-8 pb-10">
      {/* Section Header */}
      <div className="section-header flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge badge-yellow text-xs flex items-center gap-1 font-semibold">
              <BookOpen size={12} className="text-accent" /> The InteriorG Journal
            </span>
            <span className="text-xs text-muted">Architectural Insights & Artisan Chronicles</span>
          </div>
          <h2 className="text-3xl md:text-4xl m-0 font-normal font-playfair">Stories, Craft & Design</h2>
          <p className="text-muted text-xs md:text-sm mt-1 max-w-xl">
            In-depth guides on hardwood care, bespoke wall scaling, artisan guild traditions, and contemporary interior philosophies.
          </p>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="btn btn-ghost btn-sm p-2 rounded-full border border-gray-300 hover:bg-white"
            aria-label="Previous Article"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-ghost btn-sm p-2 rounded-full border border-gray-300 hover:bg-white"
            aria-label="Next Article"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Responsive Cards Slider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.slice(currentIndex, currentIndex + 3).concat(
          currentIndex + 3 > ARTICLES.length 
            ? ARTICLES.slice(0, (currentIndex + 3) - ARTICLES.length) 
            : []
        ).map((article) => (
          <article
            key={article.id}
            className="article-card bg-white rounded-lg border overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
            style={{ borderColor: '#ded9d0' }}
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-52 overflow-hidden bg-gray-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="badge badge-yellow text-xs font-semibold backdrop-blur-md bg-white/90 shadow-xs">
                    {article.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 text-white text-[11px] font-medium bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock size={11} /> {article.readTime}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted mb-2">
                  <span className="flex items-center gap-1">
                    <User size={12} /> {article.author}
                  </span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>

                <h3 className="text-lg font-playfair font-normal m-0 text-dark leading-snug group-hover:text-accent transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-muted mt-2 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {article.tags.map((tag, i) => (
                    <span key={i} className="tag text-[11px] py-0.5 px-2 bg-[#f4eee4] text-[#635142]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => setActiveArticle(article)}
                className="btn btn-ghost text-xs p-0 text-accent font-semibold flex items-center gap-1 hover:underline cursor-pointer border-none bg-transparent"
              >
                <span>Read Story</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => handleShare(article)}
                className="btn btn-ghost p-1 text-muted hover:text-dark border-none bg-transparent cursor-pointer"
                title="Share article"
              >
                <Share2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {ARTICLES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all ${
              idx === currentIndex ? 'bg-accent w-6' : 'bg-[#ded9d0]'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Full Article Reading Modal */}
      {activeArticle && (
        <div 
          className="modal-overlay fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setActiveArticle(null)}
        >
          <div 
            className="modal-box bg-[#f7f4ee] max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 btn btn-ghost p-2 rounded-full hover:bg-white text-dark cursor-pointer border-none"
              aria-label="Close reader"
            >
              <X size={20} />
            </button>

            {/* Article Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-yellow text-xs font-semibold">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock size={12} /> {activeArticle.readTime}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-playfair font-normal text-dark m-0 leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#ded9d0] text-xs text-muted">
                <div>
                  <strong className="text-dark block">{activeArticle.author}</strong>
                  <span>{activeArticle.authorRole}</span>
                </div>
                <span>•</span>
                <span>{activeArticle.date}</span>
              </div>
            </div>

            {/* Feature Image */}
            <div className="h-64 md:h-80 rounded-lg overflow-hidden mb-6">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quote Callout */}
            {activeArticle.quote && (
              <blockquote className="my-6 p-4 rounded bg-white border-l-4 border-accent shadow-xs italic text-dark text-sm md:text-base leading-relaxed">
                "{activeArticle.quote.text}"
                <footer className="text-xs text-muted font-normal mt-2 not-italic">
                  — {activeArticle.quote.speaker}
                </footer>
              </blockquote>
            )}

            {/* Article Paragraphs */}
            <div className="space-y-4 text-sm md:text-base text-dark/90 leading-relaxed font-light">
              {activeArticle.content.map((para, i) => (
                <p key={i} className="m-0">{para}</p>
              ))}
            </div>

            {/* Tags & Modal Action */}
            <div className="mt-8 pt-4 border-t border-[#ded9d0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {activeArticle.tags.map((tag, i) => (
                  <span key={i} className="tag text-xs py-0.5 px-2 bg-white text-[#635142] border border-[#ded9d0]">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveArticle(null);
                  window.location.hash = '#shop';
                }}
                className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <span>Explore Related Curations</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
