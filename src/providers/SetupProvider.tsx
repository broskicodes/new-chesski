import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogOverlay, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Experience } from '@/utils/types';
import { expToLvl, experienceToTitle } from '@/utils/clientHelpers';
import { Label } from '@/components/ui/label';
import { useStockfish } from '@/providers/StockfishProvider/context';
import { useGame } from './GameProvider';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [engineSkillLevel, setEngineSkillLevel] = useState<Experience | "Impossible">((Experience as any)[skillLvl] ?? "Impossible");
  
  const toggleModal = useCallback((show: boolean) => {
    setOpen(show);
  }, []);

  const value: SetupProviderContext =  useMemo(() => ({
    settingUp,
    currSelectedLvl: engineSkillLevel,
    toggleModal,
    setSettingUp
  }), [settingUp, engineSkillLevel, toggleModal])

  useEffect(() => {
    setEngineSkillLevel((Experience as any)[skillLvl] ?? "Impossible");
  }, [skillLvl])

  useEffect(() => {
    if (!gameId && pathname === "/play") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [gameId])

  return (
    <SetupContext.Provider value={value}>
      <Dialog open={open}>
        {/* <DialogTrigger ref={setupModalTriggerRef} className='hidden' /> */}
        <DialogContent allowClose={false}>
          <DialogHeader className='flex flex-col items-center space-y-0'>
            <DialogTitle className='text-2xl'>Game setup</DialogTitle>
            <DialogDescription>Configure the starting position for your game.</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-y-4 items-center'>
            {/* <div className='flex flex-row items-center space-x-2'> */}
              <Label className='whitespace-nowrap'>Engine Skill Level</Label>
              <div className="col-span-1 flex-grow">
              <Select 
                value={engineSkillLevel === "Impossible" ? "Impossible" : experienceToTitle(engineSkillLevel)} 
                onValueChange={(val) => setEngineSkillLevel(val === "Impossible" ? "Impossible" : (Experience as any)[val])}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Set Engine Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Skill Level</SelectLabel>
                    {Object.values(Experience).filter(e => !isNaN(Number(e))).map((e) => (
                      <SelectItem key={e} value={experienceToTitle(e as number)}>{experienceToTitle(e as number)}</SelectItem>
                    ))}
                    <SelectItem value='Impossible'>Impossible</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              </div>
            {/* </div> */}
            <Label className='whitespace-nowrap'>Choose Starting Position</Label>
            <DialogClose className='col-span-1 flex-grow'>
              <Button 
                disabled={!!gameId}
                className='w-full'
                variant="outline"
                onClick={() => {
                  uninit();
                  setOpen(false);
                  setSettingUp(true);
                }}>
                Setup Board
              </Button>
            </DialogClose>
          </div>
          <DialogFooter>
            <DialogClose className='w-full'>
              <Button 
                className='w-full'
                onClick={() => {
                  const lvl = expToLvl(engineSkillLevel)

                  uninit();
                  initEngine(true, lvl, 2000);
                  if (!gameId) {
                    newGame();
                  }
                  setOpen(false);
                }}>
                Confirm
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {children}
    </SetupContext.Provider>
  )
}