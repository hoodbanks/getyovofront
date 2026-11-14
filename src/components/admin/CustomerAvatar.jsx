import { useState } from 'react';
import { getInitials } from '../../utils/formatters';

export function CustomerAvatar({ name, photoUrl, className }) {
    const [failed, setFailed] = useState(false);
    const showPhoto = Boolean(photoUrl) && !failed;

    return (
        <div className={className}>
            {showPhoto ? (
                <img src={photoUrl} alt={name || 'Customer'} onError={() => setFailed(true)} className="h-full w-full object-cover" />
            ) : getInitials(name)}
        </div>
    );
}
