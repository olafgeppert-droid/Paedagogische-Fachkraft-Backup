// src/utils/colors.js
 
export const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
};
 
export const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
};
 
export const applyCustomColors = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-bg', colors.navigation || '#fed7aa');
    root.style.setProperty('--primary-color', colors.header || '#dc2626');
    root.style.setProperty('--secondary-color', colors.header ? darkenColor(colors.header, 20) : '#b91c1c');
    root.style.setProperty('--toolbar-bg-custom', colors.toolbar || '#f8fafc');
    root.style.setProperty('--background-color', colors.windowBackground || '#fef7ed');
    root.style.setProperty('--card-bg', colors.windowBackground ? lightenColor(colors.windowBackground, 10) : '#ffffff');
    root.style.setProperty('--modal-bg-custom', colors.windowBackground || '#ffffff');
    document.documentElement.classList.add('custom-colors-applied');
};
 
export const resetCustomColors = () => {
    const root = document.documentElement;
    root.style.removeProperty('--sidebar-bg');
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--toolbar-bg-custom');
    root.style.removeProperty('--background-color');
    root.style.removeProperty('--card-bg');
    root.style.removeProperty('--modal-bg-custom');
    document.documentElement.classList.remove('custom-colors-applied');
};
