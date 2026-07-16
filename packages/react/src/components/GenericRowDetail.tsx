import type { TranslateFn } from '@flextable/core';
import { DEFAULT_FLEXTABLE_KEYS } from '@flextable/core';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@flextable/react-ui';
import { useState } from 'react';
import type { SlotProps } from './TableContent';

export interface GenericRowDetailProps<TData> extends SlotProps<TData> {
  t: TranslateFn;
  keys?: Array<keyof TData>;
  excludedKeys?: Array<keyof TData>;
  titleKey?: string;
  showLessKey?: string;
  showMoreKey?: string;
}

const MAX_LENGTH = 150;

function ValueDisplay({
  value,
  t,
  showLessKey,
  showMoreKey,
}: {
  value: unknown;
  t: TranslateFn;
  showLessKey: string;
  showMoreKey: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const stringValue =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value ?? '');

  const isLong = stringValue.length > MAX_LENGTH;
  const displayValue =
    isLong && !expanded ? `${stringValue.slice(0, MAX_LENGTH)}...` : stringValue;

  return (
    <div className="flex flex-col items-start gap-1">
      {typeof value === 'object' && value !== null ? (
        <pre className="w-full whitespace-pre-wrap break-all rounded-md bg-muted p-2 font-mono text-sm">
          {displayValue}
        </pre>
      ) : (
        <span className="whitespace-pre-line break-all text-sm">{displayValue}</span>
      )}
      {isLong && (
        <Button
          variant="link"
          className="h-auto p-0 text-secondary text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t(showLessKey) : t(showMoreKey)}
        </Button>
      )}
    </div>
  );
}

export function GenericRowDetail<TData>({
  row,
  t,
  keys,
  excludedKeys,
  titleKey = DEFAULT_FLEXTABLE_KEYS.details,
  showLessKey = DEFAULT_FLEXTABLE_KEYS.showLess,
  showMoreKey = DEFAULT_FLEXTABLE_KEYS.showMore,
}: GenericRowDetailProps<TData>) {
  const data = row.original;
  const allKeys = keys ?? (Object.keys(data as object) as Array<keyof TData>);
  const displayKeys = excludedKeys
    ? allKeys.filter((key) => !excludedKeys.includes(key))
    : allKeys;

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 @md:grid-cols-2 @lg:grid-cols-3">
        {displayKeys.map((key) => (
          <div key={String(key)} className="flex flex-col gap-1">
            <span className="font-medium text-muted-foreground text-sm capitalize">
              {String(key)}
            </span>
            <ValueDisplay
              value={data[key]}
              t={t}
              showLessKey={showLessKey}
              showMoreKey={showMoreKey}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function createGenericRowDetail<TData>(
  t: TranslateFn,
  keys?: Array<keyof TData>,
  excludedKeys?: Array<keyof TData>,
  titleKey?: string,
) {
  return function RowDetailWrapper(props: SlotProps<TData>) {
    return (
      <GenericRowDetail
        {...props}
        t={t}
        keys={keys}
        excludedKeys={excludedKeys}
        titleKey={titleKey}
      />
    );
  };
}
