import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChatPopup } from "./ChatPopup"
import { Button } from "./ui/button"
import { faComment } from "@fortawesome/free-solid-svg-icons"

interface Props {
  hideMobile?: boolean
}

export const ChatPopupTrigger = ({ hideMobile }: Props) => {

  return (
    <div className={`${hideMobile ? "hidden sm:flex" : "flex" } items-center justify-center shadow rounded-full w-12 h-12 bg-[#fafafa] z-50 absolute bottom-2 right-2 sm:bottom-6 sm:right-6`}>
      <ChatPopup>
        <Button  variant="ghost" size="icon">
          <FontAwesomeIcon icon={faComment} size="xl" />
        </Button>
      </ChatPopup>
    </div>
  )
}