import { cn } from '@/lib/utils';

interface TagChipProps {
  name: string;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  removable?: boolean;
}

export const TagChip = ({ name, onClick, className, selected = false, removable = false }: TagChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800',
        onClick && 'hover:bg-pink-200 cursor-pointer',
        selected && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
    >
      #{name}
      {removable && (
        <span className="ml-0.5 text-pink-400 hover:text-pink-700 leading-none" aria-hidden="true">×</span>
      )}
    </button>
  );
};
