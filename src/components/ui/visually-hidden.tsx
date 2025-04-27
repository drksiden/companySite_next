import * as React from 'react';

export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLProps<HTMLSpanElement>
>(({ children, ...props }, ref) => (
  <span
    ref={ref}
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    }}
    {...props}
  >
    {children}
  </span>
));

VisuallyHidden.displayName = 'VisuallyHidden';