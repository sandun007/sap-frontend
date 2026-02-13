// import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/AppSidebar"
// import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import HotKeys from "@/pages/hotkeys/HotKeys.jsx";
import { TopNavbar } from "@/components/TopNavbar.jsx";

export function DashboardLayout() {
  // const [defaultOpen, setDefaultOpen] = useState(true)
  //
  // // Load sidebar state from localStorage
  // useEffect(() => {
  //   const stored = localStorage.getItem("sidebar_state")
  //   if (stored !== null) {
  //     setDefaultOpen(stored === "true")
  //   }
  // }, [])
  //
  // // Save sidebar state to localStorage
  // const handleOpenChange = (open) => {
  //   localStorage.setItem("sidebar_state", String(open))
  // }

  return (
      <div className="flex min-h-screen flex-col">
          <TopNavbar />
          {/*<SidebarProvider defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>*/}
          {/*<AppSidebar />*/}
          {/*<SidebarInset>*/}
          {/*<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">*/}
          {/*  <SidebarTrigger className="-ml-1" />*/}
          {/*  <div className="flex items-center gap-2">*/}
          {/*    <h1 className="text-lg font-semibold">Dashboard</h1>*/}
          {/*  </div>*/}
          {/*</header>*/}

          <main className="flex-1">
              <HotKeys />
              <div className="mx-auto py-6 px-4 md:px-6">
                  <Outlet />
              </div>
          </main>
          {/*  </SidebarInset>*/}
          {/*</SidebarProvider>*/}
      </div>

  )
}
