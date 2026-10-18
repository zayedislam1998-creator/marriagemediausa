'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Send,
  Sparkles,
  Phone,
  AlertCircle,
  MessageSquare,
  Lock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import {
  ChatMessage,
  ConversationThread,
  ChatLoungeService,
  SUNNAH_CANNED_OPENERS,
} from '@/lib/social/chat';
import { sendMessageAction } from '@/lib/social/actions';

interface HalalChatLoungeProps {
  initialConversations: ConversationThread[];
  currentUserId: string;
}

export function HalalChatLounge({
  initialConversations,
  currentUserId,
}: HalalChatLoungeProps) {
  const [conversations, setConversations] = useState<ConversationThread[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string>(
    initialConversations[0]?.id || ''
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    activeConvId ? ChatLoungeService.getMessages(activeConvId) : []
  );
  const [inputText, setInputText] = useState('');
  const [ccWali, setCcWali] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setMessages(ChatLoungeService.getMessages(id));
    setErrorMessage(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    setErrorMessage(null);

    try {
      const res = await sendMessageAction(activeConvId, inputText, ccWali);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message!]);
        setInputText('');
      } else {
        setErrorMessage(res.error || 'Failed to send message.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending message.');
    } finally {
      setSending(false);
    }
  };

  const insertOpener = (opener: string) => {
    setInputText(opener);
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        minHeight: 650,
      }}
      className="chat-lounge-grid"
    >
      {/* Left Column: Conversations List */}
      <aside
        style={{
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-app)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--emerald-600), var(--gold-500))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              💬
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                Halal Chat Lounge
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Family-Monitored Suitor Dialogue
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
          {conversations.map((c) => {
            const isActive = c.id === activeConvId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectConv(c.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--emerald-600)' : '3px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  transition: 'background 0.15s ease',
                  borderTop: 'none',
                  borderRight: 'none',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: '#E2E8F0',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={c.partnerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                    alt={c.partnerName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.partnerName}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {c.lastMessageTime}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {c.lastMessageSnippet}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', color: 'var(--emerald-700)', marginTop: 4 }}>
                    <ShieldCheck size={11} />
                    <span>Wali CC: {c.waliName}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Column: Chat Window */}
      {activeConv ? (
        <main style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
          {/* Chat Header */}
          <div
            style={{
              padding: '12px var(--space-xl)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#E2E8F0',
                }}
              >
                <img
                  src={activeConv.partnerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={activeConv.partnerName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {activeConv.partnerName}
                  <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>✓ Verified</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activeConv.partnerProfession} • {activeConv.partnerLocation}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--emerald-800)',
                  background: 'var(--emerald-50)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--emerald-200)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ShieldCheck size={12} /> Wali CC Active ({activeConv.waliName})
              </span>
            </div>
          </div>

          {/* Halal Modesty Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
              padding: '8px var(--space-xl)',
              borderBottom: '1px solid var(--emerald-100)',
              fontSize: '0.6875rem',
              color: 'var(--emerald-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              🛡️ <strong>Sunnah Adab Protected:</strong> All messages are subject to automated modesty filtering. Guardian alerts are sent in real time.
            </span>
            <span style={{ fontWeight: 700 }}>Zero Casual Dating Policy</span>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: 'var(--space-xl)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              maxHeight: 440,
            }}
          >
            {messages.map((m) => {
              const isMe = m.senderId === currentUserId || m.senderName.includes('Ayesha');
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? 'var(--emerald-600)' : 'var(--bg-app)',
                      color: isMe ? '#FFFFFF' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-card)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {m.content}
                  </div>

                  <div
                    style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{m.senderName}</span>
                    <span>•</span>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.ccWali && <span style={{ color: 'var(--emerald-700)', fontWeight: 600 }}>• Wali CC</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              style={{
                margin: '0 var(--space-xl)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--coral-50)',
                border: '1px solid var(--coral-200)',
                color: 'var(--coral-600)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sunnah Canned Openers Pills */}
          <div
            style={{
              padding: '6px var(--space-xl)',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              background: 'var(--bg-app)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', alignSelf: 'center' }}>
              💡 Sunnah Starters:
            </span>
            {SUNNAH_CANNED_OPENERS.map((opener, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertOpener(opener)}
                style={{
                  fontSize: '0.6875rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--emerald-200)',
                  background: '#FFFFFF',
                  color: 'var(--emerald-800)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {opener.slice(0, 36)}...
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px var(--space-xl)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Compose a dignified matrimonial message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  background: 'var(--bg-app)',
                }}
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="btn btn-primary"
                style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={15} /> Send
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={ccWali}
                  onChange={(e) => setCcWali(e.target.checked)}
                  style={{ accentColor: 'var(--emerald-600)' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--emerald-800)' }}>
                  ✓ Automatically CC Wali on chat updates & family call coordination
                </span>
              </label>
              <span>Press Enter to send</span>
            </div>
          </form>
        </main>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Select a conversation from the left to begin messaging
        </div>
      )}
    </div>
  );
}
