import axios from 'axios';

export class NotifyService {
  private static readonly CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  static async sendLineMessage(userId: string, message: string): Promise<void> {
    if (!userId) return;
    try {
      await axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
          to: userId,
          messages: [
            {
              type: 'text',
              text: message
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
      console.log('Message sent successfully');
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Line API Error:', error.response?.data);
      } else {
        console.error('Unexpected Error:', error);
      }
    }
  }
}