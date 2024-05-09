import { Piece } from "chess.js";
import Image from "next/image";
import { useEffect } from "react";
import { useDrag } from "react-dnd";

interface Props {
  p: Piece
}

export const DragablePiece = ({ p }: Props) => {
  const [_col, dragRef] = useDrag(() => ({
    type: "piece",
    item: {
      piece: `${p.color}${p.type.toUpperCase()}`,
      square: "null",
      id: window.innerWidth > 640 ? undefined : 0
    },
  }));

  return (
    <div ref={dragRef}>
      <Image width={48} height={48} alt="" src={`/pieces/${p.type}${p.color === "w" ? "l" : "d"}t.svg`} />
    </div>
  )
}