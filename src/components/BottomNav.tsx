import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "./ui/button"
import { faBars, faClose, faComment, faGear } from "@fortawesome/free-solid-svg-icons"
import { Sidebar } from "./Sidebar"
import { useState } from "react"
import { ChatPopup } from "./ChatPopup"

export const BottomNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden z-50 absolute bottom-2 right-2">
      {!open && (
        <div className="flex items-center justify-center shadow rounded-full w-12 h-12 bg-[#fafafa]">
          <Button onClick={() => setOpen(true)} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faBars} size="xl" />
          </Button>
        </div>
      )}
      {open && (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-center shadow rounded-full w-12 h-12 bg-[#fafafa]">
            <Sidebar>
              <Button variant="ghost" size="icon">
                <FontAwesomeIcon icon={faGear} size="xl" />
              </Button>
            </Sidebar>
          </div>
          {/* <div className="flex items-center justify-center shadow rounded-full w-12 h-12 bg-[#fafafa]">
            <ChatPopup>
              <Button  variant="ghost" size="icon">
                <FontAwesomeIcon icon={faComment} size="xl" />
              </Button>
            </ChatPopup>
          </div> */}
          <div className="flex items-center justify-center shadow rounded-full w-12 h-12 bg-[#fafafa]">
            <Button onClick={() => setOpen(false)} variant="ghost" size="icon">
              <FontAwesomeIcon icon={faClose} size="xl" />
            </Button>
          </div>
        </div>
      )}
      {/* <Sidebar>
        
      </Sidebar> */}
    </div>
  )
}