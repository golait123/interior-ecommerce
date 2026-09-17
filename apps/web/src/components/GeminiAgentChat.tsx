import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ShoppingBag, 
  Bot, 
  User, 
  CheckCircle, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sliders,
  Move
} from 'lucide-react';
import { visualizerApi, AgentChatResponse } from '../api/visualizer';
import { PlacedItem } from './Panorama360Viewer';
import toast from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: 'PLACE_ITEMS' | 'GENERATE_ROOM' | 'ADVICE';
  placedItems?: PlacedItem[];
  generatedImageUrl?: string;
  timestamp: Date;
}

interface GeminiAgentChatProps {
  cartItems: Array<{
    id: string;
    productId: string;
    name: string;
    category?: string;
    price: number;
    imageUrl: string;
  }>;
  placedItems: PlacedItem[];
  onPlacedItemsChange: (items: PlacedItem[]) => void;
  onImageUrlChange: (url: string) => void;
  roomContext: {
    roomType?: string;
    style?: string;
    width?: number;
    height?: number;
    length?: number;
    currentImageUrl?: string;
  };
}

export function GeminiAgentChat({
  cartItems,
  placedItems,
  onPlacedItemsChange,
  onImageUrlChange,
  roomContext
}: GeminiAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Gemini AI Interior Agent**.\n\nI can analyze your room, **automatically position your cart items** inside this 360° space, or **generate a brand new 360° room render** featuring your selected pieces. How can I style your room today?`,
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: textToSend,
        timestamp: new Date()
      }
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call Gemini Agent API
      const res: AgentChatResponse = await visualizerApi.agentChat({
        message: textToSend,
        cartItems: cartItems.map(c => ({
          id: c.id,
          productId: c.productId,
          name: c.name,
          category: c.category,
          price: c.price,
          imageUrl: c.imageUrl
        })),
        placedItems,
        roomContext,
        conversationHistory: newMessages.map(m => ({ role: m.role, content: m.content }))
      });

      // Update placed items if returned
      if (res.newPlacedItems && res.newPlacedItems.length > 0) {
        onPlacedItemsChange(res.newPlacedItems as PlacedItem[]);
        if (res.placedCount > 0) {
          toast.success(`✨ Gemini Agent placed ${res.placedCount} item(s) from your cart into the room!`);
        }
      }

      // Update room image if newly synthesized
      if (res.generatedImageUrl) {
        onImageUrlChange(res.generatedImageUrl);
        toast.success('✨ Gemini synthesized a new 360° room image with your cart items!');
      }

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          action: res.action,
          placedItems: res.newPlacedItems as PlacedItem[],
          generatedImageUrl: res.generatedImageUrl,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gemini Agent encountered an issue. Please try again.');
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, I encountered a connection issue. If you have items in your cart, you can still click "Place my cart items into this room" to arrange them immediately!',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🛋️ Place all cart items in room', prompt: 'Place all items from my cart into this room at appropriate wall and floor coordinates.' },
    { label: '✨ Generate 360° room with my cart', prompt: 'Generate a photorealistic 360-degree room image featuring the items in my cart.' },
    { label: '🪞 Position mirror & console', prompt: 'Where should the mirror and wooden console from my cart go in this room?' },
    { label: '💡 Evening ambient lighting', prompt: 'How does the lighting from my cart look, and what ambiance does it create?' }
  ];

  return (
    <div className="bg-white border rounded shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Agent Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-dark text-white flex justify-between items-center cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/30 border border-gold flex items-center justify-center text-gold">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold m-0 text-white">Gemini AI Image Agent</h3>
              <span className="badge badge-green text-[10px] py-0 px-1.5">Active</span>
            </div>
            <p className="text-[11px] text-gray-300 m-0">
              Powered by gemini-3.7-flash & gemini-3.1-flash-image
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-yellow text-xs flex items-center gap-1">
            <ShoppingBag size={12} /> {cartItems.length} in Cart
          </span>
          <button className="text-gray-300 hover:text-white bg-transparent border-none p-1 cursor-pointer">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Cart Status Bar */}
          <div className="px-4 py-2 bg-secondary/70 border-b flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-dark">Cart Context:</span>
              <span className="text-muted truncate">
                {cartItems.length > 0 
                  ? `${cartItems.length} article(s): ${cartItems.map(c => c.name).join(', ')}`
                  : 'Your cart is empty. Add items from the store to stage them!'}
              </span>
            </div>
            {placedItems.length > 0 && (
              <span className="badge badge-blue text-[11px] flex-shrink-0">
                {placedItems.length} placed in 360°
              </span>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 pt-2.5 pb-1 flex flex-wrap gap-1.5 bg-gray-50/50 border-b">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(qp.prompt)}
                className="text-[11px] py-1 px-2.5 bg-white border hover:border-accent text-dark font-medium rounded-full cursor-pointer transition-all hover:bg-secondary/40"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5 max-h-[360px] min-h-[220px] bg-white text-xs">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot size={13} />
                  </div>
                )}

                <div 
                  className={`max-w-[85%] p-3 rounded leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-dark text-white rounded-br-none' 
                      : 'bg-secondary/60 text-dark border rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">
                    {msg.content}
                  </div>

                  {/* If assistant generated a new 360 room image */}
                  {msg.generatedImageUrl && (
                    <div className="mt-2.5 p-2 bg-white border rounded flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-accent" />
                        <span className="font-semibold text-[11px]">360° Room Image Synthesized</span>
                      </div>
                      <span className="badge badge-green text-[10px]">Applied to 360° View</span>
                    </div>
                  )}

                  {/* If assistant placed items in the room */}
                  {msg.action === 'PLACE_ITEMS' && msg.placedItems && msg.placedItems.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-dark/10">
                      <span className="text-[11px] font-semibold text-accent block mb-1">
                        Active 3D Placements in Room:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {msg.placedItems.slice(0, 4).map((pi, pIdx) => (
                          <div key={pIdx} className="bg-white p-1.5 border rounded flex items-center gap-1.5">
                            <img src={pi.imageUrl} alt={pi.name} className="w-6 h-6 object-cover rounded" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate text-[10px] m-0">{pi.name}</p>
                              <span className="text-[9px] text-muted block">Yaw: {Math.round(pi.yaw)}°</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] block mt-1.5 ${msg.role === 'user' ? 'text-gray-300 text-right' : 'text-muted'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-dark flex-shrink-0 flex items-center justify-center mt-0.5">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-muted text-xs">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center animate-spin">
                  <Sparkles size={12} />
                </div>
                <span>Gemini AI agent is analyzing your room and cart items...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className="p-3 border-t bg-gray-50 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g. Place my cart items in the room, or restyle the wall..."
              disabled={isLoading}
              className="input text-xs py-2 px-3 flex-1 bg-white"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="btn btn-primary btn-sm py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
