import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'مجمع الشريعة التعليمي',
  description: 'منصة إدارية متكاملة تابعة للإدارة العامة للتعليم بجازان، لإدارة الموظفين والعمليات التعليمية بمجمع الشريعة.',
  openGraph: {
    title: 'مجمع الشريعة التعليمي',
    description: 'منصة إدارية متكاملة تابعة للإدارة العامة للتعليم بجازان، لإدارة الموظفين والعمليات التعليمية بمجمع الشريعة.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مجمع الشريعة التعليمي',
    description: 'منصة إدارية متكاملة تابعة للإدارة العامة للتعليم بجازان، لإدارة الموظفين والعمليات التعليمية بمجمع الشريعة.',
  },
};

import { AuthProvider } from "@/src/lib/auth-context";

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
