import { useMemo, useState } from 'react';
import { Avatar, AvatarImage } from '../components/Avatar';
import { cn, getInitials } from '../lib/cn';

export interface EntityAvatarProps {
  image?: string | null;
  name?: string | null;
  isSelected?: boolean;
  fallbackText?: string;
  altText?: string;
  className?: string;
}

function isImageSource(image: string | null | undefined): image is string {
  return !!image && (image.startsWith('http') || image.startsWith('data:image'));
}

/** Generalized from obaas-frontend's shared/entity/Avatar.tsx — no longer requires an injected i18n fallback key. */
export function EntityAvatar({
  image,
  name,
  isSelected = false,
  fallbackText,
  altText,
  className,
}: EntityAvatarProps) {
  const [imageHasError, setImageHasError] = useState(false);

  const computedFallbackText = useMemo(
    () => getInitials(name || fallbackText || '?'),
    [name, fallbackText],
  );

  const imageIsUsable = useMemo(() => isImageSource(image), [image]);

  return (
    <Avatar className={cn(isSelected ? 'border-2 border-primary' : '', className)}>
      {image && imageIsUsable && !imageHasError ? (
        <AvatarImage
          src={image}
          alt={altText || `${name || 'Entity'} avatar`}
          onError={() => setImageHasError(true)}
        />
      ) : (
        <div
          className="flex size-full items-center justify-center rounded-full bg-muted"
          data-slot="avatar-fallback"
        >
          {computedFallbackText}
        </div>
      )}
    </Avatar>
  );
}
