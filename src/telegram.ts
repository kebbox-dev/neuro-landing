// Конфигурация отправки заявок
// Заявки отправляются на серверный прокси (send.php), токен НЕ хранится в клиентском JS
// VITE_API_URL задаётся через .env (например: VITE_API_URL=http://localhost:3001/send.php)
const API_URL = import.meta.env.VITE_API_URL || './send.php';

export type FormData = {
  name: string;
  company?: string;
  phone: string;
  email?: string;
}

/**
 * Отправляет данные формы через серверный прокси в Telegram
 */
export async function sendToTelegram(data: FormData): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        company: data.company || '',
        phone: data.phone,
        email: data.email || '',
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error('Server error:', response.status, rawText);
      return false;
    }

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error('Non-JSON response:', rawText.substring(0, 500));
      return false;
    }

    return result.success === true;
  } catch (error) {
    console.error('Failed to send form:', error);
    return false;
  }
}
