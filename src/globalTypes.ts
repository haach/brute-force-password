import {FC, ReactNode} from 'react';

export interface ReactProps {
  className?: string;
  key?: string;
  onClick?(): void;
  style?: Record<string, string>; // Don't abuse this overwrite backdoor
}

export interface ReactPropsWithchildren extends ReactProps {
  children?: ReactNode | ReactNode[];
}

export type ComponentWithChildren<P = {}> = FC<ReactPropsWithchildren & P>;
