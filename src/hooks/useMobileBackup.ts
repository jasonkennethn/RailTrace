import { useState, useEffect } from 'react';

/**
 * Hook to detect if screen is less than 340px and provide mobile backup classes
 * @returns {object} Mobile backup utilities and classes
 */
export function useMobileBackup() {
  const [isUltraSmall, setIsUltraSmall] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsUltraSmall(width < 340);
      setIsSmall(width < 640);
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  /**
   * Get mobile backup classes based on screen size
   * @param {object} classes - Object with normal, small, and ultraSmall class variants
   * @returns {string} Combined classes
   */
  const getMobileClasses = (classes: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall && classes.ultraSmall) {
      return classes.ultraSmall;
    }
    if (isSmall && classes.small) {
      return classes.small;
    }
    return classes.normal || '';
  };

  /**
   * Get responsive spacing classes
   * @param {object} spacing - Spacing configuration
   * @returns {string} Responsive spacing classes
   */
  const getSpacing = (spacing: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return spacing.ultraSmall || 'mobile-backup-p-sm';
    }
    if (isSmall) {
      return spacing.small || 'mobile-backup-p-md';
    }
    return spacing.normal || 'p-4';
  };

  /**
   * Get responsive text size classes
   * @param {object} textSize - Text size configuration
   * @returns {string} Responsive text classes
   */
  const getTextSize = (textSize: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return textSize.ultraSmall || 'mobile-backup-text-sm';
    }
    if (isSmall) {
      return textSize.small || 'mobile-backup-text-base';
    }
    return textSize.normal || 'text-base';
  };

  /**
   * Get responsive icon size classes
   * @param {object} iconSize - Icon size configuration
   * @returns {string} Responsive icon classes
   */
  const getIconSize = (iconSize: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return iconSize.ultraSmall || 'mobile-backup-icon-sm';
    }
    if (isSmall) {
      return iconSize.small || 'mobile-backup-icon-md';
    }
    return iconSize.normal || 'h-5 w-5';
  };

  /**
   * Get responsive avatar size classes
   * @param {object} avatarSize - Avatar size configuration
   * @returns {string} Responsive avatar classes
   */
  const getAvatarSize = (avatarSize: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return avatarSize.ultraSmall || 'mobile-backup-avatar-sm';
    }
    if (isSmall) {
      return avatarSize.small || 'mobile-backup-avatar-md';
    }
    return avatarSize.normal || 'w-10 h-10';
  };

  /**
   * Get responsive button classes
   * @param {object} buttonConfig - Button configuration
   * @returns {string} Responsive button classes
   */
  const getButtonClasses = (buttonConfig: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return buttonConfig.ultraSmall || 'mobile-backup-button';
    }
    if (isSmall) {
      return buttonConfig.small || 'px-3 py-1.5 text-sm';
    }
    return buttonConfig.normal || 'px-4 py-2 text-base';
  };

  /**
   * Get responsive layout classes
   * @param {object} layout - Layout configuration
   * @returns {string} Responsive layout classes
   */
  const getLayout = (layout: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return layout.ultraSmall || 'mobile-backup-stack';
    }
    if (isSmall) {
      return layout.small || 'flex-col sm:flex-row';
    }
    return layout.normal || 'flex-row';
  };

  /**
   * Get responsive gap classes
   * @param {object} gap - Gap configuration
   * @returns {string} Responsive gap classes
   */
  const getGap = (gap: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return gap.ultraSmall || 'mobile-backup-gap-xs';
    }
    if (isSmall) {
      return gap.small || 'gap-2';
    }
    return gap.normal || 'gap-3';
  };

  /**
   * Get responsive padding classes
   * @param {object} padding - Padding configuration
   * @returns {string} Responsive padding classes
   */
  const getPadding = (padding: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return padding.ultraSmall || 'mobile-backup-p-sm';
    }
    if (isSmall) {
      return padding.small || 'p-3';
    }
    return padding.normal || 'p-4';
  };

  /**
   * Get responsive margin classes
   * @param {object} margin - Margin configuration
   * @returns {string} Responsive margin classes
   */
  const getMargin = (margin: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return margin.ultraSmall || 'mobile-backup-m-sm';
    }
    if (isSmall) {
      return margin.small || 'm-3';
    }
    return margin.normal || 'm-4';
  };

  /**
   * Get responsive width classes
   * @param {object} width - Width configuration
   * @returns {string} Responsive width classes
   */
  const getWidth = (width: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return width.ultraSmall || 'mobile-backup-w-full';
    }
    if (isSmall) {
      return width.small || 'w-full sm:w-auto';
    }
    return width.normal || 'w-auto';
  };

  /**
   * Get responsive height classes
   * @param {object} height - Height configuration
   * @returns {string} Responsive height classes
   */
  const getHeight = (height: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return height.ultraSmall || 'mobile-backup-h-auto';
    }
    if (isSmall) {
      return height.small || 'h-auto';
    }
    return height.normal || 'h-auto';
  };

  /**
   * Get responsive border radius classes
   * @param {object} radius - Border radius configuration
   * @returns {string} Responsive border radius classes
   */
  const getBorderRadius = (radius: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return radius.ultraSmall || 'mobile-backup-rounded';
    }
    if (isSmall) {
      return radius.small || 'rounded-md';
    }
    return radius.normal || 'rounded-lg';
  };

  /**
   * Get responsive text truncation classes
   * @param {object} truncation - Truncation configuration
   * @returns {string} Responsive truncation classes
   */
  const getTruncation = (truncation: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return truncation.ultraSmall || 'mobile-backup-truncate';
    }
    if (isSmall) {
      return truncation.small || 'truncate';
    }
    return truncation.normal || 'truncate';
  };

  /**
   * Get responsive visibility classes
   * @param {object} visibility - Visibility configuration
   * @returns {string} Responsive visibility classes
   */
  const getVisibility = (visibility: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return visibility.ultraSmall || 'mobile-backup-hidden';
    }
    if (isSmall) {
      return visibility.small || 'hidden sm:block';
    }
    return visibility.normal || 'block';
  };

  /**
   * Get responsive display classes
   * @param {object} display - Display configuration
   * @returns {string} Responsive display classes
   */
  const getDisplay = (display: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return display.ultraSmall || 'mobile-backup-flex';
    }
    if (isSmall) {
      return display.small || 'flex';
    }
    return display.normal || 'flex';
  };

  /**
   * Get responsive position classes
   * @param {object} position - Position configuration
   * @returns {string} Responsive position classes
   */
  const getPosition = (position: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return position.ultraSmall || 'mobile-backup-relative';
    }
    if (isSmall) {
      return position.small || 'relative';
    }
    return position.normal || 'relative';
  };

  /**
   * Get responsive z-index classes
   * @param {object} zIndex - Z-index configuration
   * @returns {string} Responsive z-index classes
   */
  const getZIndex = (zIndex: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return zIndex.ultraSmall || 'mobile-backup-z-10';
    }
    if (isSmall) {
      return zIndex.small || 'z-10';
    }
    return zIndex.normal || 'z-10';
  };

  /**
   * Get responsive overflow classes
   * @param {object} overflow - Overflow configuration
   * @returns {string} Responsive overflow classes
   */
  const getOverflow = (overflow: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return overflow.ultraSmall || 'mobile-backup-overflow-hidden';
    }
    if (isSmall) {
      return overflow.small || 'overflow-hidden';
    }
    return overflow.normal || 'overflow-hidden';
  };

  /**
   * Get responsive color classes
   * @param {object} color - Color configuration
   * @returns {string} Responsive color classes
   */
  const getColor = (color: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return color.ultraSmall || 'mobile-backup-text-primary';
    }
    if (isSmall) {
      return color.small || 'text-foreground-light dark:text-foreground-dark';
    }
    return color.normal || 'text-foreground-light dark:text-foreground-dark';
  };

  /**
   * Get responsive background classes
   * @param {object} background - Background configuration
   * @returns {string} Responsive background classes
   */
  const getBackground = (background: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return background.ultraSmall || 'mobile-backup-bg-secondary';
    }
    if (isSmall) {
      return background.small || 'bg-card-light dark:bg-card-dark';
    }
    return background.normal || 'bg-card-light dark:bg-card-dark';
  };

  /**
   * Get responsive border classes
   * @param {object} border - Border configuration
   * @returns {string} Responsive border classes
   */
  const getBorder = (border: {
    normal?: string;
    small?: string;
    ultraSmall?: string;
  }) => {
    if (isUltraSmall) {
      return border.ultraSmall || 'mobile-backup-border';
    }
    if (isSmall) {
      return border.small || 'border-border-light dark:border-border-dark';
    }
    return border.normal || 'border-border-light dark:border-border-dark';
  };

  return {
    isUltraSmall,
    isSmall,
    getMobileClasses,
    getSpacing,
    getTextSize,
    getIconSize,
    getAvatarSize,
    getButtonClasses,
    getLayout,
    getGap,
    getPadding,
    getMargin,
    getWidth,
    getHeight,
    getBorderRadius,
    getTruncation,
    getVisibility,
    getDisplay,
    getPosition,
    getZIndex,
    getOverflow,
    getColor,
    getBackground,
    getBorder,
  };
}
