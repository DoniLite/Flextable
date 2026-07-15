import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SlotProps } from './TableContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GenericRowDetailProps<
  TData extends Record<string, unknown>,
> extends SlotProps<TData> {
  keys?: Array<keyof TData>;
  excludedKeys?: Array<keyof TData>;
  titleKey?: string;
}

const MAX_LENGTH = 150;

function ValueDisplay({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const stringValue =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value ?? '');

  const isLong = stringValue.length > MAX_LENGTH;
  const displayValue =
    isLong && !expanded
      ? `${stringValue.slice(0, MAX_LENGTH)}...`
      : stringValue;

  return (
    <div className="flex flex-col items-start gap-1">
      {typeof value === 'object' && value !== null ? (
        <pre className="text-sm whitespace-pre-wrap break-all font-mono bg-muted p-2 rounded-md w-full">
          {displayValue}
        </pre>
      ) : (
        <span className="text-sm whitespace-pre-line break-all">
          {displayValue}
        </span>
      )}
      {isLong && (
        <Button
          variant="link"
          className="p-0 h-auto text-xs text-secondary"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t('common.showLess') : t('common.showMore')}
        </Button>
      )}
    </div>
  );
}

export function GenericRowDetail<TData extends Record<string, unknown>>({
  row,
  keys,
  excludedKeys,
  titleKey = 'common.details',
}: GenericRowDetailProps<TData>) {
  const { t } = useTranslation();
  const data = row.original;

  const allKeys = keys || (Object.keys(data) as Array<keyof TData>);
  const displayKeys = excludedKeys
    ? allKeys.filter((key) => !excludedKeys.includes(key))
    : allKeys;

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayKeys.map((key) => {
          return (
            <div key={String(key)} className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground capitalize">
                {String(key)}
              </span>
              <ValueDisplay value={data[key]} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function createGenericRowDetail<TData extends Record<string, unknown>>(
  keys?: Array<keyof TData>,
  excludedKeys?: Array<keyof TData>,
  titleKey?: string,
) {
  return function RowDetailWrapper(props: SlotProps<TData>) {
    return (
      <GenericRowDetail
        {...props}
        keys={keys}
        excludedKeys={excludedKeys}
        titleKey={titleKey}
      />
    );
  };
}
