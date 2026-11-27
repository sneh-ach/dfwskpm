import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { UpcomingBanner } from '../home/UpcomingBanner'
import { AnnouncementBanner, AnnouncementPopup } from '../announcements/AnnouncementSystem'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <UpcomingBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Footer />
      </div>
      <MobileBottomNav />
      <AnnouncementPopup />
    </div>
  )
}
