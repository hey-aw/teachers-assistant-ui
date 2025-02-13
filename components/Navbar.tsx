'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-[60px] bg-white/80 backdrop-blur-sm border-b border-gray-200/50 z-50 flex items-center px-4">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-semibold">
                        🦔 Teacher's Assistant
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div>
                        <button onClick={() => changeLanguage('en')} className="px-2 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500">
                            {t('english')}
                        </button>
                        <button onClick={() => changeLanguage('es')} className="px-2 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 ml-2">
                            {t('spanish')}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
