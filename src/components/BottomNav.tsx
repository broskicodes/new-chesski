import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "./ui/button"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { Sidebar } from "./Sidebar"

export const BottomNav = () => {

  return (
    <div className="sm:hidden z-10 absolute bottom-2 right-2 shadow flex items-center justify-center rounded-full w-12 h-12 bg-[#fafafa]">
      <Sidebar>
        <Button variant="ghost" size="icon">
          <FontAwesomeIcon icon={faBars} size="xl" />
        </Button>
      </Sidebar>
    </div>
  )
}