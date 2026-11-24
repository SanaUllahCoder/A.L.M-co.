import { useEffect } from 'react';

export default function Modal({ children, onClose, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`modal-panel ${wide ? 'modal-wide' : ''}`}>{children}</div>
    </div>
  );
}
