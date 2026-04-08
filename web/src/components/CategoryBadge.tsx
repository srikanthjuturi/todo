import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  name: string;
  className?: string;
}

const getBadgeColor = (name: string) => {
  const colors = [
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  ];
  
  // Simple hash function to deterministically pick a color based on category name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const CategoryBadge = ({ name, className }: CategoryBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        getBadgeColor(name),
        className
      )}
    >
      {name}
    </span>
  );
};
