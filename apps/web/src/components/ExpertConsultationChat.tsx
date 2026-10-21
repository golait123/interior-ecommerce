import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Compass, 
  Sprout, 
  Calculator, 
  PhoneCall, 
  User, 
  CheckCircle2, 
  Minimize2, 
  RotateCcw,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }[];
}

const QUICK_PROMPTS = [
  "Calculate rolls for 12×10 ft wall",
  "Recommend pet-friendly bedroom plants",
  "Which wallpapers suit low natural light?",
  "Book a free architect home visit"
];

export function ExpertConsultationChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message from the InteriorG Architect AI
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Namaste! I am your InteriorG AI Design Consultant. I can recommend designer wallpapers, calculate roll requirements with zero wastage, suggest biophilic plants for your light conditions, or arrange certified installation. What space would you like to design today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        {
          label: 'Launch 360° Studio',
          action: () => {
            navigate('/room-studio');
            setIsOpen(false);
          },
          icon: <Compass size={13} />
        },
        {
          label: 'Calculate Wall Rolls',
          action: () => {
            navigate('/#calculator');
            setIsOpen(false);
          },
          icon: <Calculator size={13} />
        }
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate intelligent AI interior consultation
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = "";
      let replyActions: Message['actions'] = undefined;

      if (lower.includes('roll') || lower.includes('calculate') || lower.includes('dimension') || lower.includes('feet') || lower.includes('sq ft') || lower.includes('size')) {
        replyText = "For standard Indian room heights (9 to 10 ft), a standard InteriorG roll (57 sq.ft / 5.3 m²) covers approximately 50 sq.ft of billable area after accounting for 10% pattern repeat matching. For a typical 12×10 ft wall (120 sq.ft), you will need exactly 3 rolls. Would you like to test finishes on this wall in our 360° Studio?";
        replyActions = [
          {
            label: 'Test in 360° Studio',
            action: () => { navigate('/room-studio'); setIsOpen(false); },
            icon: <Compass size={13} />
          },
          {
            label: 'Shop Wallpaper Rolls',
            action: () => { navigate('/shop?category=wallpapers'); setIsOpen(false); },
            icon: <Layers size={13} />
          }
        ];
      } else if (lower.includes('plant') || lower.includes('pet') || lower.includes('nursery') || lower.includes('green') || lower.includes('indoor')) {
        replyText = "For homes with pets (cats & dogs), we specifically recommend non-toxic foliage: Areca Palms, Boston Ferns, Peperomia, and Money Plants. For high air purification without heavy watering, the Snake Plant and ZZ Plant are exceptional. Explore our nursery collection delivered in moisture-safe packaging:";
        replyActions = [
          {
            label: 'Browse Nursery Plants',
            action: () => { navigate('/gardening'); setIsOpen(false); },
            icon: <Sprout size={13} />
          },
          {
            label: 'Bespoke Nursery Studio',
            action: () => { navigate('/gardening/customize'); setIsOpen(false); },
            icon: <Sparkles size={13} />
          }
        ];
      } else if (lower.includes('light') || lower.includes('dark') || lower.includes('sun') || lower.includes('bedroom')) {
        replyText = "For rooms with minimal natural sunlight, we recommend reflective textured wallpapers like Raw Linen Silk, Venetian Marble Cream, or light botanical motifs that bounce ambient light. In addition, pair them with shade-loving plants like the Cast Iron Plant or Calathea Peacock.";
        replyActions = [
          {
            label: 'View Botanical Prints',
            action: () => { navigate('/shop?category=botanical'); setIsOpen(false); },
            icon: <Layers size={13} />
          }
        ];
      } else if (lower.includes('visit') || lower.includes('book') || lower.includes('appointment') || lower.includes('expert') || lower.includes('consult')) {
        replyText = "Our certified interior architects offer complimentary in-person site visits across 50+ major cities (including Delhi NCR, Mumbai, Bengaluru, Hyderabad, and Pune). They bring physical roll swatches and laser measurement tools. Would you like to confirm a callback?";
        replyActions = [
          {
            label: 'Book Free Architect Visit',
            action: () => {
              toast.success('Your consultation request has been received! An architect will call within 2 business hours.');
            },
            icon: <Calendar size={13} />
          }
        ];
      } else {
        replyText = `Thank you for sharing your inquiry! InteriorG specializes in bespoke luxury wallpapers, acoustic 3D wall paneling, and curated nursery plants. All our materials include a 10-year colorfast warranty, certified installation, and free swatch samples. How can we best help configure your space?`;
        replyActions = [
          {
            label: 'Explore 360° Studio',
            action: () => { navigate('/room-studio'); setIsOpen(false); },
            icon: <Compass size={13} />
          },
          {
            label: 'View All Collections',
            action: () => { navigate('/shop'); setIsOpen(false); },
            icon: <Layers size={13} />
          }
        ];
      }

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: replyActions
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="expert-chat-widget">
      {/* 1. FLOATING ACTION TRIGGER PILL (Bottom Right Corner) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="expert-chat-trigger"
          aria-label="Open Expert Consultation AI Chat"
        >
          <div className="chat-trigger-icon-box">
            <Sparkles size={16} className="text-gold" />
          </div>
          <div className="chat-trigger-text">
            <span className="chat-trigger-title">Expert Consultation</span>
            <span className="chat-trigger-sub">
              <span className="online-pulsing-dot" />
              AI Architect Online
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="chat-unread-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* 2. CHAT POPUP WINDOW */}
      {isOpen && (
        <div className="expert-chat-box">
          {/* Header */}
          <div className="chat-box-header">
            <div className="flex items-center gap-2.5">
              <div className="chat-avatar-box">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="chat-header-title">InteriorG AI Consultant</h4>
                  <span className="chat-verified-badge" title="Verified Interior Architect Model">
                    <CheckCircle2 size={12} className="text-[#68D391]" />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#A0AEC0]">
                  <span className="online-pulsing-dot" />
                  <span>Senior Space Planning & Wallpaper Architect</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="chat-header-btn"
                aria-label="Minimize consultation"
                title="Minimize"
              >
                <Minimize2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="chat-header-btn"
                aria-label="Close consultation"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chat-messages-container">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${m.sender === 'user' ? 'user-row' : 'ai-row'}`}
              >
                {m.sender === 'ai' && (
                  <div className="chat-msg-avatar">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}
                <div className="chat-bubble-content">
                  <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                    <p className="chat-msg-text">{m.text}</p>
                    <span className="chat-msg-time">{m.timestamp}</span>
                  </div>

                  {/* Optional Action Buttons inside message */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="chat-actions-row">
                      {m.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={act.action}
                          className="chat-action-btn"
                        >
                          {act.icon}
                          <span>{act.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row ai-row">
                <div className="chat-msg-avatar">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="chat-bubble ai-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="chat-quick-prompts">
            <span className="quick-prompts-label">Quick Inquiries:</span>
            <div className="quick-prompts-scroll">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="quick-prompt-chip"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Field */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Ask about wallpapers, plant care, roll sizing..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="chat-text-input"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="chat-send-btn"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
