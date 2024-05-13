import { PropsWithChildren, useEffect, useRef } from "react"
import { Popover, PopoverAnchor, PopoverContent, PopoverPortal, PopoverTrigger } from "./ui/popover"
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAssistant } from "@/providers/AssistantProvider";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const ChatPopup = ({ children }: PropsWithChildren) => {
  const { input, messages, status, handleInputChange, submitMessage, clearChat } = useAssistant();

  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <Popover modal={true} onOpenChange={(open) => {
      if (!open)
        return;

      setTimeout(() => {
        msgRef.current?.scrollIntoView();
      }, 100)
    }}>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverAnchor className="fixed bottom-0 right-0" />
      {/* </PopoverAnchor> */}
      <PopoverPortal>
        <PopoverContent className="flex flex-col h-96 w-80 sm:h-[480px] sm:w-[400px]">
          <div className="flex flex-row space-x-2 items-center mb-2">
            <span className="font-bold">
              Chat
            </span>
            <Badge variant="outline" className="bg-gray-200 w-fit py-1 px-3">
              Beta
            </Badge>
          </div>
          <ScrollArea className="w-full h-full">
            <div className="flex flex-col text-sm space-y-2">
              {messages.map((m, i) => (
                <div className={`flex flex-row w-full`} style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.role === "assistant" && (
                    <Avatar size="sm">
                      <AvatarImage src="/chesski-logo.svg" />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                  )}
                  <div key={i} className={`p-4 rounded-lg w-9/12 ${m.role === "user" ? "bg-indigo-100" : "bg-gray-100"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
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