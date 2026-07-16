import { cn } from '../lib/cn';

export interface EntityTitleProps {
  title: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  hasDescription?: boolean;
}

/** Direct port of obaas-frontend's shared/entity/TitleWithDesc.tsx — zero app coupling to begin with. */
export function EntityTitle({
  title,
  description = '',
  titleClassName = '',
  descriptionClassName = '',
  hasDescription = true,
}: EntityTitleProps) {
  return (
    <div className="flex w-full flex-col">
      <span
        className={cn(
          'truncate text-foreground',
          titleClassName,
          hasDescription && 'font-medium',
        )}
        data-testid="entity-title"
      >
        {title}
      </span>
      {hasDescription && description && (
        <span
          className={cn('w-full truncate text-muted-foreground', descriptionClassName)}
          data-testid="entity-description"
        >
          {description}
        </span>
      )}
    </div>
  );
}
