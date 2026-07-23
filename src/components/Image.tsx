import { useEffect, useState } from 'react';

interface ImageProps {
  src: string;
  caption?: string;
  alt?: string;
  width?: number | string;
  maxWidth?: number | string;
  expandable?: boolean;
}

/**
 * Figure with optional caption and click-to-zoom lightbox.
 * Use inside MDX: <Image src="/images/foo.png" caption="..." expandable />
 */
export default function Image({ src, caption, alt, width, maxWidth, expandable }: ImageProps) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoomed(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoomed]);

  return (
    <figure>
      <img
        src={src}
        alt={alt ?? caption ?? ''}
        loading="lazy"
        style={{
          width: width ?? '100%',
          maxWidth: maxWidth as string | number | undefined,
          margin: '0 auto',
          display: 'block',
          cursor: expandable ? 'zoom-in' : 'default',
        }}
        onClick={expandable ? () => setZoomed(true) : undefined}
      />
      {caption && <figcaption dangerouslySetInnerHTML={{ __html: caption }} />}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            cursor: 'zoom-out',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={src} alt={alt ?? caption ?? ''} style={{ maxWidth: '92vw', maxHeight: '88vh' }} />
        </div>
      )}
    </figure>
  );
}
