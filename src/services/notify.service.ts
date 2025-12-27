import axios from 'axios';

export class NotifyService {
  static async sendLineNotify(token: string, message: string): Promise<void> {
    if (!token) return;
    try {
      await axios.post(
        'https://notify-api.line.me/api/notify',
        `message=${encodeURIComponent(message)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Line Notify Error:', error);
    }
  }
}