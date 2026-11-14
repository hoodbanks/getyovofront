export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=getyovo.com';
export const APP_STORE_URL = 'https://apps.apple.com/ng/app/getyovo/id6777520447';

export function openAppStoreBadges() {
    const section = document.getElementById('get-the-app');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
    }
    return false;
}
