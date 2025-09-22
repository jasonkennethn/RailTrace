import React from 'react';
import { useMobileBackup } from '../../hooks/useMobileBackup';

interface MobileBackupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  textSize?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  layout?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  padding?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  margin?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  width?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  height?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  borderRadius?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  background?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  border?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  color?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  display?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  position?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  zIndex?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  overflow?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  gap?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  truncation?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
  visibility?: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  };
}

/**
 * MobileBackup component that automatically applies mobile backup classes
 * when screen size is less than 340px
 */
export function MobileBackup({
  children,
  className = '',
  spacing,
  textSize,
  layout,
  padding,
  margin,
  width,
  height,
  borderRadius,
  background,
  border,
  color,
  display,
  position,
  zIndex,
  overflow,
  gap,
  truncation,
  visibility,
  ...props
}: MobileBackupProps) {
  const {
    getSpacing,
    getTextSize,
    getLayout,
    getPadding,
    getMargin,
    getWidth,
    getHeight,
    getBorderRadius,
    getBackground,
    getBorder,
    getColor,
    getDisplay,
    getPosition,
    getZIndex,
    getOverflow,
    getGap,
    getTruncation,
    getVisibility,
  } = useMobileBackup();

  // Build responsive classes
  const responsiveClasses = [
    spacing && getSpacing(spacing),
    textSize && getTextSize(textSize),
    layout && getLayout(layout),
    padding && getPadding(padding),
    margin && getMargin(margin),
    width && getWidth(width),
    height && getHeight(height),
    borderRadius && getBorderRadius(borderRadius),
    background && getBackground(background),
    border && getBorder(border),
    color && getColor(color),
    display && getDisplay(display),
    position && getPosition(position),
    zIndex && getZIndex(zIndex),
    overflow && getOverflow(overflow),
    gap && getGap(gap),
    truncation && getTruncation(truncation),
    visibility && getVisibility(visibility),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={responsiveClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * MobileBackupCard - Pre-configured card component with mobile backup
 */
export function MobileBackupCard({
  children,
  className = '',
  ...props
}: Omit<MobileBackupProps, 'spacing' | 'layout' | 'padding' | 'background' | 'border' | 'borderRadius'>) {
  return (
    <MobileBackup
      className={`mobile-backup-card ${className}`}
      spacing={{
        normal: 'space-y-4',
        small: 'space-y-3',
        ultraSmall: 'mobile-backup-space-y-sm',
      }}
      layout={{
        normal: 'flex flex-col',
        small: 'flex flex-col',
        ultraSmall: 'mobile-backup-stack',
      }}
      padding={{
        normal: 'p-4',
        small: 'p-3',
        ultraSmall: 'mobile-backup-p-sm',
      }}
      background={{
        normal: 'bg-card-light dark:bg-card-dark',
        small: 'bg-card-light dark:bg-card-dark',
        ultraSmall: 'mobile-backup-bg-secondary',
      }}
      border={{
        normal: 'border border-border-light dark:border-border-dark',
        small: 'border border-border-light dark:border-border-dark',
        ultraSmall: 'mobile-backup-border',
      }}
      borderRadius={{
        normal: 'rounded-lg',
        small: 'rounded-lg',
        ultraSmall: 'mobile-backup-rounded-lg',
      }}
      {...props}
    >
      {children}
    </MobileBackup>
  );
}

/**
 * MobileBackupButton - Pre-configured button component with mobile backup
 */
export function MobileBackupButton({
  children,
  className = '',
  ...props
}: Omit<MobileBackupProps, 'padding' | 'textSize' | 'borderRadius' | 'background' | 'color' | 'display' | 'width'>) {
  return (
    <MobileBackup
      className={`mobile-backup-button ${className}`}
      padding={{
        normal: 'px-4 py-2',
        small: 'px-3 py-1.5',
        ultraSmall: 'mobile-backup-button',
      }}
      textSize={{
        normal: 'text-base',
        small: 'text-sm',
        ultraSmall: 'mobile-backup-text-sm',
      }}
      borderRadius={{
        normal: 'rounded-lg',
        small: 'rounded-md',
        ultraSmall: 'mobile-backup-rounded',
      }}
      background={{
        normal: 'bg-primary',
        small: 'bg-primary',
        ultraSmall: 'mobile-backup-primary-bg',
      }}
      color={{
        normal: 'text-white',
        small: 'text-white',
        ultraSmall: 'mobile-backup-primary',
      }}
      display={{
        normal: 'inline-flex',
        small: 'inline-flex',
        ultraSmall: 'mobile-backup-inline-flex',
      }}
      width={{
        normal: 'w-auto',
        small: 'w-auto',
        ultraSmall: 'mobile-backup-w-full',
      }}
      {...props}
    >
      {children}
    </MobileBackup>
  );
}

/**
 * MobileBackupList - Pre-configured list component with mobile backup
 */
export function MobileBackupList({
  children,
  className = '',
  ...props
}: Omit<MobileBackupProps, 'layout' | 'gap' | 'padding' | 'background' | 'border' | 'borderRadius'>) {
  return (
    <MobileBackup
      className={`mobile-backup-list ${className}`}
      layout={{
        normal: 'flex flex-col',
        small: 'flex flex-col',
        ultraSmall: 'mobile-backup-stack',
      }}
      gap={{
        normal: 'gap-3',
        small: 'gap-2',
        ultraSmall: 'mobile-backup-gap-xs',
      }}
      padding={{
        normal: 'p-4',
        small: 'p-3',
        ultraSmall: 'mobile-backup-p-sm',
      }}
      background={{
        normal: 'bg-card-light dark:bg-card-dark',
        small: 'bg-card-light dark:bg-card-dark',
        ultraSmall: 'mobile-backup-bg-secondary',
      }}
      border={{
        normal: 'border border-border-light dark:border-border-dark',
        small: 'border border-border-light dark:border-border-dark',
        ultraSmall: 'mobile-backup-border',
      }}
      borderRadius={{
        normal: 'rounded-lg',
        small: 'rounded-lg',
        ultraSmall: 'mobile-backup-rounded-lg',
      }}
      {...props}
    >
      {children}
    </MobileBackup>
  );
}

/**
 * MobileBackupModal - Pre-configured modal component with mobile backup
 */
export function MobileBackupModal({
  children,
  className = '',
  ...props
}: Omit<MobileBackupProps, 'layout' | 'padding' | 'background' | 'border' | 'borderRadius' | 'position' | 'zIndex' | 'overflow'>) {
  return (
    <MobileBackup
      className={`mobile-backup-modal ${className}`}
      layout={{
        normal: 'flex flex-col',
        small: 'flex flex-col',
        ultraSmall: 'mobile-backup-stack',
      }}
      padding={{
        normal: 'p-6',
        small: 'p-4',
        ultraSmall: 'mobile-backup-p-sm',
      }}
      background={{
        normal: 'bg-card-light dark:bg-card-dark',
        small: 'bg-card-light dark:bg-card-dark',
        ultraSmall: 'mobile-backup-bg-secondary',
      }}
      border={{
        normal: 'border border-border-light dark:border-border-dark',
        small: 'border border-border-light dark:border-border-dark',
        ultraSmall: 'mobile-backup-border',
      }}
      borderRadius={{
        normal: 'rounded-xl',
        small: 'rounded-lg',
        ultraSmall: 'mobile-backup-rounded-lg',
      }}
      position={{
        normal: 'relative',
        small: 'relative',
        ultraSmall: 'mobile-backup-relative',
      }}
      zIndex={{
        normal: 'z-50',
        small: 'z-50',
        ultraSmall: 'mobile-backup-z-50',
      }}
      overflow={{
        normal: 'overflow-hidden',
        small: 'overflow-hidden',
        ultraSmall: 'mobile-backup-overflow-hidden',
      }}
      {...props}
    >
      {children}
    </MobileBackup>
  );
}

/**
 * MobileBackupForm - Pre-configured form component with mobile backup
 */
export function MobileBackupForm({
  children,
  className = '',
  ...props
}: Omit<MobileBackupProps, 'layout' | 'gap' | 'padding' | 'background' | 'border' | 'borderRadius'>) {
  return (
    <MobileBackup
      className={`mobile-backup-form ${className}`}
      layout={{
        normal: 'flex flex-col',
        small: 'flex flex-col',
        ultraSmall: 'mobile-backup-stack',
      }}
      gap={{
        normal: 'gap-4',
        small: 'gap-3',
        ultraSmall: 'mobile-backup-gap-sm',
      }}
      padding={{
        normal: 'p-6',
        small: 'p-4',
        ultraSmall: 'mobile-backup-p-sm',
      }}
      background={{
        normal: 'bg-card-light dark:bg-card-dark',
        small: 'bg-card-light dark:bg-card-dark',
        ultraSmall: 'mobile-backup-bg-secondary',
      }}
      border={{
        normal: 'border border-border-light dark:border-border-dark',
        small: 'border border-border-light dark:border-border-dark',
        ultraSmall: 'mobile-backup-border',
      }}
      borderRadius={{
        normal: 'rounded-lg',
        small: 'rounded-lg',
        ultraSmall: 'mobile-backup-rounded-lg',
      }}
      {...props}
    >
      {children}
    </MobileBackup>
  );
}
