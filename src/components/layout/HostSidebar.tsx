'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  QrCode, 
  CreditCard,
  PlusCircle,
  MapPin,
  MessageSquare,
  FileEdit,
  Scan,
  UserCheck,
  Building,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HostSidebarProps {
  user: any;
  dbUser?: any;
}

const menuItems = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    title: 'My Events',
    icon: Calendar,
    subpages: [
      { name: 'Published events', href: '/events/published', icon: Calendar },
      { name: 'Drafted Events', href: '/events/drafts', icon: FileEdit },
      { name: 'Create new event', href: '/events/create', icon: PlusCircle },
      { name: 'Event comments', href: '/events/comments', icon: MessageSquare },
      { name: 'Event Locations', href: '/events/locations', icon: MapPin },
    ],
  },
  {
    title: 'Host Profile',
    icon: Users,
    href: '/profile',
  },
  {
    title: 'Attendance',
    icon: QrCode,
    subpages: [
      { name: 'Events Attendees', href: '/attendance/events', icon: Users },
      { name: 'Scanner', href: '/attendance/scanner', icon: Scan },
      { name: 'All attendees', href: '/attendance/all', icon: UserCheck },
    ],
  },
  {
    title: 'Billing',
    icon: CreditCard,
    subpages: [
      { name: 'My Bank details', href: '/billing/bank', icon: Building },
      { name: 'My Payouts', href: '/billing/payouts', icon: DollarSign },
      { name: 'My earnings', href: '/billing/earnings', icon: TrendingUp },
    ],
  },
];

export function HostSidebar({ user, dbUser }: HostSidebarProps) {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Close mobile submenu when path changes
  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setActiveMenu(activeMenu === title ? null : title);
  };

  const activeSubpages = menuItems.find(item => item.title === activeMenu)?.subpages;

  return (
    <>
      {/* DESKTOP SLIM SIDEBAR */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-20 pt-[73px] bg-white border-r border-gray-100 flex-col items-center z-40 transition-all">
        <div className="flex-1 w-full py-6 flex flex-col items-center gap-6">
          {menuItems.map((item) => {
            const isActive = item.href 
              ? pathname === item.href 
              : item.subpages?.some(s => pathname.startsWith(s.href));

            if (item.href) {
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  title={item.title}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all relative group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                      : "text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </Link>
              );
            }

            return (
              <div key={item.title} className="relative group w-full flex justify-center">
                <button
                  title={item.title}
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                      : "text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </button>
                
                {/* Desktop Hover/Click Submenu */}
                <div className={cn("absolute left-full top-0 z-50 pl-2", activeMenu === item.title ? "block" : "hidden group-hover:block")}>
                  <div className="bg-white shadow-xl shadow-gray-200/50 border border-gray-100 rounded-2xl w-64 py-3 px-2">
                    <div className="px-3 pb-2 mb-2 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {item.title}
                    </div>
                    {item.subpages?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                            isSubActive 
                            ? "bg-indigo-50 text-indigo-700" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                        )}
                      >
                        <sub.icon className="w-4 h-4" />
                        {sub.name}
                      </Link>
                    );
                  })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-50 flex justify-between items-center px-6">
        {menuItems.map((item) => {
          const isActive = item.href 
            ? pathname === item.href 
            : item.subpages?.some(s => pathname.startsWith(s.href)) || activeMenu === item.title;

          return item.href ? (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                isActive ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-indigo-50/50")} />
              <span className="text-[10px] font-bold">{item.title}</span>
            </Link>
          ) : (
            <button
              key={item.title}
              onClick={() => toggleMenu(item.title)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                isActive ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-indigo-50/50")} />
              <span className="text-[10px] font-bold">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE SUBMENU POPUP */}
      {activeMenu && activeSubpages && (
        <>
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" 
            onClick={() => setActiveMenu(null)}
          />
          <div className="md:hidden fixed bottom-24 left-4 right-4 bg-white shadow-2xl shadow-gray-300/40 border border-gray-100 rounded-3xl z-50 p-3 flex flex-col gap-1 animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="px-3 pt-2 pb-3 mb-1 border-b border-gray-50 flex justify-between items-center">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider">{activeMenu}</span>
              <button onClick={() => setActiveMenu(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            {activeSubpages.map((sub) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    isSubActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50" 
                      : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                  )}
                >
                  <sub.icon className="w-5 h-5" />
                  {sub.name}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
