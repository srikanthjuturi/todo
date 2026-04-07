import { cn } from '@/lib/utils';

interface TagChipProps {
  name: string;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

export const TagChip = ({ name, onClick, className, selected = false }: TagChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800',
        onClick && 'hover:bg-gray-200 cursor-pointer',
        selected && 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        className
      )}
    >
      #{name}
    </button>
  );
};
