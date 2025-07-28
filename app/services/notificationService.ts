import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  extra?: Record<string, any>;
}

export async function sendNotification({ userId, title, body, icon = 'notifications-outline', extra = {} }: SendNotificationParams) {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      icon,
      timestamp: serverTimestamp(),
      ...extra,
    });
  } catch (e) {
    console.error('Error sending notification:', e);
  }
} 