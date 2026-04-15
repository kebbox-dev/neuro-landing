// Конфигурация Telegram бота
// Переменные окружения задаются в файле .env (не коммитить в git!)
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export interface FormData {
  name: string;
  company?: string;
  phone: string;
  email?: string;
}

/**
 * Отправляет данные формы в Telegram бот
 */
export async function sendToTelegram(data: FormData): Promise<boolean> {
  const text = `
🔔 <b>Новая заявка!</b>

👤 <b>Имя:</b> ${data.name}
🏢 <b>Компания:</b> ${data.company || 'Не указана'}
📞 <b>Телефон:</b> ${data.phone}
📧 <b>E-mail:</b> ${data.email || 'Не указан'}
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'html',
      }),
    });

    if (!response.ok) {
      console.error('Telegram API error:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send to Telegram:', error);
    return false;
  }
}
