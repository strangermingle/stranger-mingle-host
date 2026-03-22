'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  QrCode, 
  CreditCard,
  ChevronDown,
  ChevronRight,
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Automatically expand section based on current path
  useEffect(() => {
    const currentSection = menuItems.find(item => 
      item.subpages?.some(sub => pathname.startsWith(sub.href)) || 
      (item.href && pathname === item.href)
    );
    if (currentSection && currentSection.title) {
      setExpandedSection(currentSection.title);
    }
  }, [pathname]);

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  const hostName = dbUser?.username || user?.email?.split('@')[0] || 'Host Name';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 w-16 md:w-64 pt-[73px]">
      
      {/* Sidebar Header */}
      <div className="flex flex-col items-center md:items-start p-4 border-b border-gray-50 bg-gray-50/50">
         <h2 className="hidden md:block text-base font-black text-gray-900 truncate w-full uppercase tracking-tight">
            {hostName}
         </h2>
         <p className="hidden md:block text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
            Host Dashboard
         </p>
         {/* Mobile view avatar representation instead of text */}
         <div className="md:hidden flex h-8 w-8 rounded-full bg-indigo-100 items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white">
            {hostName.charAt(0).toUpperCase()}
         </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-2 md:px-4 hide-scrollbar">
        <ul className="space-y-1.5 flex flex-col items-center md:items-stretch">
          {menuItems.map((item) => {
            const isMenuExpanded = expandedSection === item.title;
            const isMenuPathActive = item.href ? pathname === item.href : item.subpages?.some(s => pathname.startsWith(s.href));

            return (
              <li key={item.title} className="w-full relative group">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center md:justify-between px-3 py-3 md:px-4 md:py-3.5 rounded-xl transition-all duration-200 group relative",
                      isMenuPathActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600"
                    )}
                    title={item.title}
                  >
                    <div className="flex items-center justify-center md:justify-start gap-3 w-full">
                      <item.icon className={cn("h-5 w-5 shrink-0", isMenuPathActive ? "text-white" : "text-current")} />
                      <span className="hidden md:block text-xs font-bold tracking-wide">{item.title}</span>
                    </div>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleSection(item.title)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-3 md:px-4 md:py-3.5 rounded-xl transition-all duration-200",
                        isMenuPathActive 
                          ? (isMenuExpanded ? "bg-indigo-50 text-indigo-700" : "bg-indigo-600 text-white shadow-lg shadow-indigo-200")
                          : "text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600",
                        !isMenuExpanded && !isMenuPathActive && "hover:bg-gray-50"
                      )}
                      title={item.title}
                    >
                      <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto">
                        <item.icon className={cn("h-5 w-5 shrink-0", isMenuPathActive && !isMenuExpanded ? "text-white" : "text-current")} />
                        <span className="hidden md:block text-xs font-bold tracking-wide">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "hidden md:block h-4 w-4 shrink-0 transition-transform duration-300",
                          isMenuExpanded ? "rotate-180" : "rotate-0",
                          isMenuPathActive && !isMenuExpanded ? "text-white" : "text-current"
                        )}
                      />
                    </button>

                    {/* Subpages logic: Desktop expands vertically, Mobile shows a floating menu on hover or click (for simplicity, we let mobile user see it on click if we want, but since mobile is only icon, a generic approach is standard) */}
                    <div className={cn(
                        "md:block overflow-hidden transition-all duration-300 ease-in-out",
                        isMenuExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      {isMenuExpanded && (
                         <div className="md:hidden absolute left-16 top-0 ml-2 bg-white rounded-xl shadow-xl border border-gray-100 w-48 z-50 py-2">
                             {item.subpages?.map((subpage) => {
                                const isSubActive = pathname === subpage.href;
                                return (
                                  <Link
                                    key={subpage.href}
                                    href={subpage.href}
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors",
                                      isSubActive ? "text-indigo-600 bg-indigo-50" : "text-zinc-500 hover:text-indigo-600 hover:bg-gray-50"
                                    )}
                                  >
                                    <subpage.icon className="h-4 w-4" />
                                    {subpage.name}
                                  </Link>
                                );
                             })}
                         </div>
                      )}

                      <ul className="hidden md:flex flex-col gap-1 mt-2 mb-2 relative before:content-[''] before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                        {item.subpages?.map((subpage) => {
                          const isSubActive = pathname === subpage.href;
                          return (
                            <li key={subpage.name}>
                              <Link
                                href={subpage.href}
                                className={cn(
                                  "flex items-center gap-3 py-2.5 pl-10 pr-4 text-xs font-semibold rounded-lg transition-all relative",
                                  isSubActive 
                                    ? "text-indigo-700 bg-indigo-50/50 before:content-[''] before:absolute before:left-[19px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-indigo-600" 
                                    : "text-zinc-500 hover:text-indigo-600 hover:bg-gray-50/80 before:content-[''] before:absolute before:left-[20px] before:w-[3px] before:h-[3px] before:rounded-full before:bg-gray-300 hover:before:bg-indigo-400"
                                )}
                              >
                                {subpage.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
