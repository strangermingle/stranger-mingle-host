'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function CreateEventButton({ isLoggedIn, activePageId }: { isLoggedIn: boolean, activePageId?: string }) {
  let href = '/login?next=/host-dashboard/create';

  if (isLoggedIn) {
    if (activePageId) {
      href = `/host-dashboard/${activePageId}/create-event`;
    } else {
      href = '/create-event';
    }
  }

  return (
    <Link
      href={href}
      className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
    >
      <Plus className="h-4 w-4" />
      Create Event
    </Link>
  );
}
