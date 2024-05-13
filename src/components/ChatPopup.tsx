import { PropsWithChildren, useEffect, useRef } from "react"
import { Popover, PopoverAnchor, PopoverContent, PopoverPortal, PopoverTrigger } from "./ui/popover"
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAssistant } from "@/providers/AssistantProvider";
import { ScrollArea } from "./ui/scroll-area";

export const ChatPopup = ({ children }: PropsWithChildren) => {
  const { input, messages, status, handleInputChange, submitMessage, clearChat } = useAssistant();

  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <Popover>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverAnchor className="fixed bottom-0 right-0" />
      {/* </PopoverAnchor> */}
      <PopoverPortal>
        <PopoverContent className="flex flex-col h-96">
          <div className="font-bold">
            Chat
          </div>
          <ScrollArea className="h-full text-sm" >
            {messages.map((m, i) => (
              <div key={i}>{m.content}</div>
            ))}
            <div className="" ref={msgRef} />
          </ScrollArea>
          <form onSubmit={submitMessage} className="mt-2 space-y-1">
            <Input placeholder="Enter text here" value={input} onChange={handleInputChange} />
          
            <div className="flex flex-row space-x-1">
              <Button type="submit" className="w-full">
                submit
              </Button>
              <Button onClick={async () => {
                clearChat();
              }}>
                clear
              </Button>
            </div>
          </form>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}