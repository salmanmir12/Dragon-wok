/**
 * Kitchen Audio & Voice Notification Engine
 * - Web Audio API dual-tone synthesized bell chime (no external MP3 asset dependency)
 * - Web Speech API Text-to-Speech: "New Order Received! Order Number: [Order_ID]"
 * - Handles browser autoplay unlock policies
 */

class KitchenAudioAlertManager {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private isRinging: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    // Check if user previously unlocked in this session
    if (typeof window !== 'undefined') {
      this.isUnlocked = sessionStorage.getItem('kitchen_audio_unlocked') === 'true';
    }
  }

  public getUnlocked(): boolean {
    return this.isUnlocked;
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

      // Play a short, nearly silent chime to ensure browser recognizes user interaction
      this.playChime(0.1);

      // Pre-warm Web Speech API
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
   * Synthesize a loud, clear dual-frequency kitchen bell chime
   */
  public playChime(volume = 0.5) {
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

      // Restaurant POS chime frequencies (High-low ping)
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
   * Speak out the order notification using Web Speech API:
   * "New order received. Order number [order_id]. Total bill: [total] Rupees."
   */
  public speakOrder(orderId: string, totalAmount?: number) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      // Format order id for clear pronunciation e.g. "D W 3 1 3 2 2 2"
      const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, ' ');
      let text = `New order received. Order number: ${cleanId}.`;
      if (typeof totalAmount === 'number' && totalAmount > 0) {
        text += ` Total bill: ${Math.round(totalAmount)} Rupees.`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Send native background browser notification if permission is granted
   */
  public sendBrowserNotification(orderId: string, customerName?: string, totalAmount?: number) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      if (Notification.permission === 'granted') {
        const body = `${customerName ? `${customerName} • ` : ''}${totalAmount ? `Total: Rs. ${totalAmount.toLocaleString()} • ` : ''}Awaiting kitchen acceptance`;
        new Notification(`🔥 New Order Received: #${orderId}`, {
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
   * Trigger noticeable audio chime + voice announcement + background notification
   */
  public startOrderAlarm(orderId: string, totalAmount?: number, customerName?: string) {
    this.unlock();
    this.stopOrderAlarm(); // Clear any existing loop

    this.isRinging = true;

    // Send browser push notification if dashboard is backgrounded
    this.sendBrowserNotification(orderId, customerName, totalAmount);

    // Speak announcement once immediately
    this.speakOrder(orderId, totalAmount);

    // Play chime sound
    this.playChime(0.65);

    // Periodic repeat chime (alert bell) while ringing
    this.intervalId = setInterval(() => {
      if (!this.isRinging) {
        this.stopOrderAlarm();
        return;
      }
      this.playChime(0.65);
    }, 1800);
  }

  public stopOrderAlarm() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }
}

export const kitchenAudioAlert = new KitchenAudioAlertManager();
