import React, { useEffect, useRef } from 'react';

export type SyncEventType =
  | 'PROFILE_UPDATED'
  | 'MEMBER_PROVISIONED'
  | 'SETTINGS_UPDATED'
  | 'CV_UPDATED'
  | 'PACKAGE_UPDATED'
  | 'PROPOSAL_UPDATED'
  | 'REQUIREMENTS_UPDATED'
  | 'FORM_LAYOUT_UPDATED';

export interface SyncMessage {
  type: SyncEventType;
  payload?: any;
  timestamp: number;
  sourceTabId: string;
}

const CHANNEL_NAME = 'muslimbibah_cross_tab_sync';

// Generate unique tab session ID
const CURRENT_TAB_ID = typeof window !== 'undefined'
  ? `tab_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
  : 'server_tab';

/**
 * Broadcast an event across all open tabs without full-page reloads.
 */
export function broadcastSyncEvent(type: SyncEventType, payload?: any) {
  if (typeof window === 'undefined') return;

  const message: SyncMessage = {
    type,
    payload,
    timestamp: Date.now(),
    sourceTabId: CURRENT_TAB_ID,
  };

  // 1. Broadcast to other open tabs via standard HTML5 BroadcastChannel
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(message);
      channel.close();
    }
  } catch (err) {
    console.warn('[Sync] BroadcastChannel error:', err);
  }

  // 2. Dispatch local event for the active tab itself
  try {
    window.dispatchEvent(new CustomEvent('mb_cross_tab_sync', { detail: message }));
  } catch (err) {
    console.warn('[Sync] Local dispatch error:', err);
  }
}

/**
 * React hook to listen for real-time cross-tab events.
 * Executes callback without any full-page reload.
 */
export function useCrossTabSync(
  onSync: (message: SyncMessage) => void,
  listenTypes?: SyncEventType[]
) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const listenTypesRef = useRef(listenTypes);
  listenTypesRef.current = listenTypes;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;

    const handleMessage = (msg: SyncMessage) => {
      const types = listenTypesRef.current;
      if (!types || types.includes(msg.type)) {
        onSyncRef.current(msg);
      }
    };

    // 1. Listen for messages from OTHER tabs via BroadcastChannel
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.type) {
          handleMessage(event.data);
        }
      };
    }

    // 2. Listen for messages from THIS tab via CustomEvent
    const handleLocalEvent = (event: Event) => {
      const customEvent = event as CustomEvent<SyncMessage>;
      if (customEvent.detail && customEvent.detail.type) {
        handleMessage(customEvent.detail);
      }
    };

    window.addEventListener('mb_cross_tab_sync', handleLocalEvent);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('mb_cross_tab_sync', handleLocalEvent);
    };
  }, []);
}
