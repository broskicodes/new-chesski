import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogOverlay,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Experience } from "@/utils/types";
import { expToLvl, experienceToTitle } from "@/utils/clientHelpers";
import { Label } from "@/components/ui/label";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useGame } from "./GameProvider";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider/context";
import { useUserData } from "./UserDataProvider/context";
import Link from "next/link";
import { Cross2Icon } from "@radix-ui/react-icons";

export interface SetupProviderContext {
  settingUp: boolean;
  toggleModal: (show: boolean) => void;
  setSettingUp: Dispatch<SetStateAction<boolean>>;
}

export const SetupContext = createContext<SetupProviderContext>({
  settingUp: false,
  toggleModal: (_show) => {
    throw new Error("SetupProvider not initialized");
  },
  setSettingUp: () => {
    throw new Error("SetupProvider not initialized");
  },
});

export const useSetup = () => useContext(SetupContext);

export const SetupProvider = ({ children }: PropsWithChildren) => {
  const { initEngine, uninit, skillLvl } = useStockfish();
  const { newGame, gameId } = useGame();
  const { session, supabase } = useAuth();
  const pathname = usePathname();
  const { isPro } = useUserData();

  const [open, setOpen] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [engineSkillLevel, setEngineSkillLevel] = useState<
    Experience | "Impossible"
  >((Experience as any)[skillLvl] ?? "Impossible");

  const [dailyGames, setDailyGames] = useState(0);
  const [gamesLoaded, setGamesLoaded] = useState(false);

  const paymeref = useRef<HTMLButtonElement>(null);

  const getDailyGames = useCallback(async () => {
    if (!session || !supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("games")
      .select("created_at")
      .eq("user_id", session.id);

    if (data) {
      const das = data.filter((a) => {
        const ad = new Date(a.created_at);
        const td = new Date();

        return ad.getDate() === td.getDate() && ad.getMonth() === td.getMonth();
      })
      setDailyGames(das.length);
    } else {
      setDailyGames(0);
    }

    setGamesLoaded(true);
  }, [session, supabase]);

  const toggleModal = useCallback(async (show: boolean) => {
    await getDailyGames();
    // if (show) {
    //   paymeref.current?.click();
    // }

    setOpen(show);
  }, [getDailyGames]);

  const value: SetupProviderContext = useMemo(
    () => ({
      settingUp,
      currSelectedLvl: engineSkillLevel,
      toggleModal,
      setSettingUp,
    }),
    [settingUp, engineSkillLevel, toggleModal],
  );

  useEffect(() => {
    setEngineSkillLevel((Experience as any)[skillLvl] ?? "Impossible");
  }, [skillLvl]);

  useEffect(() => {
    if (!gameId && pathname === "/play") {
      toggleModal(true);
    } else {
      toggleModal(false);
    }
  }, [gameId, pathname, toggleModal]);

  return (
    <SetupContext.Provider value={value}>
      {(dailyGames >= 1 && !isPro) && (
        <Dialog open={gamesLoaded && open && !!session}>
          {/* <DialogTrigger ref={paymeref} className='hidden' /> */}
          <DialogContent allowClose={false}>
            <DialogClose onClick={() => setOpen(false) } className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <DialogHeader>
              <DialogTitle>
                  Daily games limit reached
              </DialogTitle>
              <DialogDescription>
                Want more? Claim your free trial now!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Link href="/subscribe" target="_blank" className={`w-full text-xl ${buttonVariants({ size: "lg", variant: "default" })}`}>
                Claim Free Trial
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {(dailyGames < 1 || isPro) && (
        <Dialog open={gamesLoaded && open && !!session}>
          <DialogContent allowClose={false}>
            <DialogHeader className="flex flex-col items-center space-y-0">
              <DialogTitle className="text-2xl">Game setup</DialogTitle>
              <DialogDescription>
                Configure the starting position for your game.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-y-4 items-center">
              {/* <div className='flex flex-row items-center space-x-2'> */}
              <Label className="whitespace-nowrap">Engine Skill Level</Label>
              <div className="col-span-1 flex-grow">
                <Select
                  value={
                    engineSkillLevel === "Impossible"
                      ? "Impossible"
                      : experienceToTitle(engineSkillLevel)
                  }
                  onValueChange={(val) =>
                    setEngineSkillLevel(
                      val === "Impossible"
                        ? "Impossible"
                        : (Experience as any)[val],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Set Engine Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Skill Level</SelectLabel>
                      {Object.values(Experience)
                        .filter((e) => !isNaN(Number(e)))
                        .map((e) => (
                          <SelectItem
                            key={e}
                            value={experienceToTitle(e as number)}
                          >
                            {experienceToTitle(e as number)}
                          </SelectItem>
                        ))}
                      <SelectItem value="Impossible">Impossible</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* </div> */}
              <Label className="whitespace-nowrap">
                Choose Starting Position
              </Label>
              <DialogClose className="col-span-1 flex-grow">
                <Button
                  disabled={!!gameId}
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    uninit();
                    setOpen(false);
                    setSettingUp(true);
                  }}
                >
                  Setup Board
                </Button>
              </DialogClose>
            </div>
            <DialogFooter>
              <DialogClose className="w-full">
                <Button
                  className="w-full"
                  onClick={() => {
                    const lvl = expToLvl(engineSkillLevel);

                    uninit();
                    initEngine(true, lvl, 2000);
                    if (!gameId) {
                      newGame();
                    }
                    setOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {children}
    </SetupContext.Provider>
  );
};
