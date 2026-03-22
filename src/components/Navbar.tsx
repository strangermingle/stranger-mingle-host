'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { logoutAction } from '@/actions/auth.actions';
import { CreateEventButton } from './layout/CreateEventButton';

export default function Navbar({ user, dbUser, activePageId }: { 
    user?: any, 
    dbUser?: any, 
    activePageId?: string 
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[9999] w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50">
                <nav className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0" onClick={closeMobileMenu}>
                        <Image
                            src="/logo-2.svg"
                            alt="Stranger Mingle Host"
                            width={180}
                            height={45}
                            className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-none"
                            priority
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-zinc-700">
                        {/* Inject CreateEventButton before auth block */}
                        <div className="hidden sm:block">
                             <CreateEventButton 
                                isLoggedIn={!!user} 
                                activePageId={activePageId}
                             />
                        </div>

                        {user ? (
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="relative group">
                                    <button className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-2 hover:bg-gray-50 transition-colors">
                                        {dbUser?.avatar_url ? (
                                            <img src={dbUser.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                            {(dbUser?.username || dbUser?.email || 'H').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-black uppercase tracking-tight">{dbUser?.username || dbUser?.email || 'User'}</span>
                                    </button>
                                    {/* Invisible wrapper to bridge the hover gap */}
                                    <div className="absolute right-0 top-full pt-2 hidden w-48 group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="rounded-2xl bg-white py-2 shadow-2xl ring-1 ring-black ring-opacity-5 border border-gray-50 overflow-hidden">
                                            <Link href="/profile" className="block px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50">Personal Account</Link>
                                            <div className="h-px bg-gray-50 my-1 mx-4"></div>
                                            <form action={logoutAction} className="block w-full text-left">
                                                <button type="submit" className="block w-full px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50">Sign out</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-4">
                                <Link href="/login" className="hover:text-black transition-colors hidden sm:block">
                                    Log in
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Hamburger Button (Mobile Only) */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-100 transition-colors shrink-0 ml-2"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span
                                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                    }`}
                            />
                            <span
                                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                    }`}
                            />
                            <span
                                className={`w-6 h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[99999] sm:hidden"
                    onClick={closeMobileMenu}
                    style={{ top: '73px' }}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`fixed right-4 top-[85px] w-[calc(100vw-32px)] sm:w-80 max-w-[340px] bg-white shadow-2xl z-[999999] sm:hidden rounded-2xl border border-gray-100 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="flex flex-col h-full p-5">
                    <div className="mb-4">
                        <CreateEventButton 
                            isLoggedIn={!!user} 
                            activePageId={activePageId}
                        />
                    </div>

                    <div className="pt-5 border-t border-gray-100">
                        {user ? (
                            <div className="space-y-2">
                                <Link
                                    href="/profile"
                                    className="block w-full px-4 py-3 text-sm bg-gray-50 text-zinc-900 text-center rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Host Profile
                                </Link>
                                <form action={logoutAction} className="block w-full text-left pt-2">
                                    <button type="submit" className="block w-full px-4 py-3 text-sm text-red-600 text-center font-bold hover:bg-red-50 rounded-xl transition-colors" onClick={closeMobileMenu}>
                                        Sign out
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-3 text-sm bg-gray-50 text-zinc-900 text-center rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Log in
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Footer or extra links can go here */}
                </div>
            </div>
        </>
    );
}
