/**
 * Kitchen Audio & Voice Notification Engine
 * - Web Audio API synthesized bell chime
 * - Web Speech API Text-to-Speech: Announces ONLY "New order received. Order number DW-XXXXXX"
 *   (Bill amounts, subtotals, or prices are NEVER spoken aloud)
 * - Periodic reminder rings while orders are pending
 * - Reminders stop immediately when staff accepts the order
 * - Tracks separate pending states for concurrent orders
 * - Quiet initialization so old orders do not ring on first load or refresh
 */

class KitchenAudioAlertManager {
  private ctx: AudioContext | null = null;
  private reminderIntervalId: any = null;
  private pendingOrderIds = new Set<string>();
  private announcedOrderIds = new Set<string>();
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isUnlocked = sessionStorage.getItem('kitchen_audio_unlocked') === 'true';
    }
  }

  public getUnlocked(): boolean {
    return this.isUnlocked;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public unlock(): boolean {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Play soft click to ensure browser marks audio unlocked
      this.playChime(0.1);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      this.isUnlocked = true;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('kitchen_audio_unlocked', 'true');
      }
      return true;
    } catch (e) {
      console.warn('Could not unlock audio context:', e);
      return false;
    }
  }

  /**
   * Synthesize a clear restaurant kitchen bell chime
   */
  public playChime(volume = 0.5) {
    if (this.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Restaurant POS chime frequencies (Dual-tone alert)
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.12);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } catch (err) {
      console.warn('Audio chime playback error:', err);
    }
  }

  /**
   * Speak out the order announcement using Web Speech API:
   * "New order received. Order number DW-123456."
   * STRICT REQUIREMENT: Does NOT speak bill amounts, prices, or totals!
   */
  public speakNewOrder(orderId: string) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      // Format order id clearly (e.g. "D W 3 1 3 2 2 2")
      const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(`New order received. Order number: ${cleanId}.`);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Background desktop push notification
   */
  public sendBrowserNotification(orderId: string, customerName?: string, totalAmount?: number) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      if (Notification.permission === 'granted') {
        const body = `${customerName ? `${customerName} • ` : ''}${totalAmount ? `Rs. ${totalAmount.toLocaleString()} • ` : ''}Pending Kitchen Acceptance`;
        new Notification(`🔥 New Order: #${orderId}`, {
          body,
          icon: '/images/dragon_wok_logo.jpg',
          tag: orderId,
        });
      }
    } catch (e) {
      console.warn('Browser notification error:', e);
    }
  }

  /**
   * Step 1: Genuine new order arrived
   * - Trigger chime ring
   * - Speak announcement: "New order received. Order number [orderId]"
   * - Track pending order and start reminder ring loop
   */
  public onNewOrderArrived(orderId: string, customerName?: string, totalAmount?: number) {
    if (this.announcedOrderIds.has(orderId)) return;
    this.announcedOrderIds.add(orderId);
    this.pendingOrderIds.add(orderId);

    // Initial alert: chime ring + spoken announcement of order number
    if (!this.isMuted) {
      this.playChime(0.65);
      this.speakNewOrder(orderId);
    }

    this.sendBrowserNotification(orderId, customerName, totalAmount);

    // Step 2: Keep reminder loop active while any orders remain pending
    this.startReminderLoop();
  }

  /**
   * Step 2: Periodic reminder ring while orders remain pending
   * Plays short reminder chime every 6 seconds.
   * Does NOT repeat the spoken announcement!
   */
  private startReminderLoop() {
    if (this.reminderIntervalId) return;

    this.reminderIntervalId = setInterval(() => {
      if (this.pendingOrderIds.size === 0) {
        this.stopReminderLoop();
        return;
      }
      // Play reminder ring chime
      if (!this.isMuted) {
        this.playChime(0.45);
      }
    }, 6000);
  }

  private stopReminderLoop() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Step 3: Kitchen accepts an order
   * - Remove that order from pending set
   * - If no other orders are pending, stops reminder ring immediately!
   * - If other orders are still pending, reminders continue for them.
   */
  public onOrderAccepted(orderId: string) {
    this.pendingOrderIds.delete(orderId);
    if (this.pendingOrderIds.size === 0) {
      this.stopReminderLoop();
    }
  }

  /**
   * Mark all existing orders quiet on initial load or page refresh
   * Prevents old orders from ringing or speaking when opening the dashboard
   */
  public markInitialOrdersQuiet(orderIds: string[]) {
    orderIds.forEach((id) => this.announcedOrderIds.add(id));
  }

  /**
   * Get set of currently ringing pending order IDs
   */
  public getPendingOrderIds(): Set<string> {
    return this.pendingOrderIds;
  }

  /**
   * Silence all current active alerts
   */
  public silenceAll() {
    this.pendingOrderIds.clear();
    this.stopReminderLoop();
  }

  /**
   * Compatibility alias for starting new order alert and announcement
   * Note: bill amount is NOT announced aloud per requirements
   */
  public startOrderAlarm(orderId: string, total?: number, customerName?: string) {
    this.onNewOrderArrived(orderId, customerName, total);
  }

  /**
   * Compatibility alias for stopping order alarm (single order or all)
   */
  public stopOrderAlarm(orderId?: string) {
    if (orderId) {
      this.onOrderAccepted(orderId);
    } else {
      this.silenceAll();
    }
  }

  /**
   * Compatibility alias for speaking new order
   * Explicitly avoids speaking the bill amount
   */
  public speakOrder(orderId: string, _total?: number) {
    this.speakNewOrder(orderId);
  }
}

export const kitchenAudioAlert = new KitchenAudioAlertManager();
