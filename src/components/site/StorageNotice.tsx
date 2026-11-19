import { useEffect, useState } from 'react';
import { storageAvailable } from '../../lib/storage';

export default function StorageNotice() {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => setBlocked(!storageAvailable()), []);
  if (!blocked) return null;
  return (
    <div className="storage-notice" role="note">
      <strong>Obs!</strong> Din webbläsare tillåter inte lokal lagring. Labbarna fungerar ändå, men ditt arbete sparas inte när du laddar om eller stänger sidan.
    </div>
  );
}
