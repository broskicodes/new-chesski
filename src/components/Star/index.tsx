interface StarProps {
  filled: boolean;
  onClick: () => void;
}

export const Star = ({ filled, onClick }: StarProps) => {
  return (
    <span className="cursor-pointer" onClick={onClick}>
      {filled ? "★" : "☆"}
    </span>
  );
};
