import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
    title: 'Home Care Service',
    description: 'Professional home care and maintenance scheduling',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
