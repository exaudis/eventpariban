import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#C5A059',
                    hover: '#B08C47',
                    light: '#FAF5EA',
                    dark: '#967433',
                },
                dark: '#202020',
                bodytext: '#242424',
                secondary: '#6B6B6B',
                eventbg: '#F7F6F3',
                surface: '#FFFFFF',
                eventborder: '#E2DFDA',
                success: '#3F7355',
                error: '#A33A3A',
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
