import React from 'react';
import { Camera } from 'lucide-react';

/**
 * Shared avatar component used across all profile pages.
 * - Shows profile photo if available
 * - Shows initials placeholder for new users
 * - Renders a camera badge for upload
 */
const ProfileAvatar = ({
  src,
  name = '',
  size = 'lg',          // 'md' | 'lg'
  shape = 'rounded-2xl',
  loading = false,
  onClick,
  inputRef,
  onFileChange,
}) => {
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const dim = size === 'md' ? 'w-20 h-20 text-2xl' : 'w-24 h-24 text-3xl';

  return (
    <div className="relative shrink-0">
      {src ? (
        <img
          src={src}
          alt={name || 'Profile'}
          className={`${dim} ${shape} object-cover shadow-sm bg-gray-100 cursor-pointer`}
          onClick={onClick}
        />
      ) : (
        <div
          onClick={onClick}
          className={`${dim} ${shape} bg-primary/10 flex items-center justify-center cursor-pointer shadow-sm select-none`}
        >
          <span className="font-headline font-black text-primary leading-none">{initials}</span>
        </div>
      )}

      {/* Camera badge */}
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary/80 active:scale-95 transition-all border-2 border-white disabled:opacity-60"
        title="Change photo"
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera size={13} />
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ProfileAvatar;
